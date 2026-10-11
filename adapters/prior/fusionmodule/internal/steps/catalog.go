package steps

import (
	"encoding/json"
	"fmt"
	"regexp"

	api "github.com/kai/prior/moduleapi/v1"
)

// The shapes below carry exactly the keys Prior's loader decodes
// (internal/fusionhost/external_catalog.go at 6080ba76): a key more or less is
// a refused bundle there, so it is a refused bundle here too.

var assetID = regexp.MustCompile(`^[a-z][a-z0-9-]*$`)

// Alias is a Prior id that names a canonical role in one domain.
type Alias struct {
	ID     string `json:"id"`
	Domain string `json:"domain"`
}

// Role is one catalog.json entry.
type Role struct {
	ID         string            `json:"id"`
	ClaudeName *string           `json:"claude_name"`
	PriorIDs   []string          `json:"prior_ids"`
	Aliases    []Alias           `json:"aliases"`
	Support    map[string]string `json:"support"`
}

// Profile is profiles/<id>.json: the seven keys Prior reads.
type Profile struct {
	ID              string            `json:"id"`
	InputSchema     string            `json:"input_schema"`
	ResultSchema    string            `json:"result_schema"`
	ToolsCeiling    []string          `json:"tools_ceiling"`
	MayDelegate     bool              `json:"may_delegate"`
	WritesWorkbench map[string]bool   `json:"writes_workbench"`
	ExecutionPolicy map[string]string `json:"execution_policy"`
}

// Step is one workflow step: a role or a host service, with the hand-over and
// completion objects left raw for the workflow that interprets them.
type Step struct {
	ID          string          `json:"id"`
	Role        string          `json:"role,omitempty"`
	HostService string          `json:"host_service,omitempty"`
	InputFrom   json.RawMessage `json:"input_from"`
	Completion  json.RawMessage `json:"completion"`
}

// Workflow is workflows/<id>.v1.json.
type Workflow struct {
	ID          string   `json:"id"`
	Capability  string   `json:"capability"`
	Steps       []Step   `json:"steps"`
	ReviseBound int      `json:"revise_bound"`
	Requires    []string `json:"requires"`
}

// Catalog resolves role names, canonical and alias, to supported roles.
type Catalog struct {
	roles map[string]Role
	names map[string]Alias
}

// LoadCatalog decodes catalog.json with Prior's checks: unique canonical ids,
// two support states each from the three words, every prior id either the
// canonical id or a declared alias, no alias shadowing a role or another alias.
func LoadCatalog(b *Bundle) (*Catalog, error) {
	body, err := b.Asset("catalog.json")
	if err != nil {
		return nil, err
	}
	var doc struct {
		Schema string            `json:"schema"`
		Roles  []json.RawMessage `json:"roles"`
	}
	if decodeExact(body, &doc, "schema", "roles") != nil || doc.Schema != "fusion.catalog/v1" || len(doc.Roles) == 0 {
		return nil, fmt.Errorf("%w: catalog.json", ErrBundle)
	}
	c := &Catalog{roles: map[string]Role{}, names: map[string]Alias{}}
	for _, raw := range doc.Roles {
		var r Role
		if decodeExact(raw, &r, "id", "claude_name", "prior_ids", "aliases", "support") != nil || !assetID.MatchString(r.ID) || r.PriorIDs == nil || r.Aliases == nil || len(r.Support) != 2 {
			return nil, fmt.Errorf("%w: catalog.json role %q", ErrBundle, r.ID)
		}
		for _, host := range []string{"prior", "claude-code"} {
			switch r.Support[host] {
			case "supported", "planned", "unsupported":
			default:
				return nil, fmt.Errorf("%w: catalog.json role %q support.%s", ErrBundle, r.ID, host)
			}
		}
		if _, exists := c.roles[r.ID]; exists {
			return nil, fmt.Errorf("%w: catalog.json role %q twice", ErrBundle, r.ID)
		}
		c.roles[r.ID] = r
	}
	for id := range c.roles {
		c.names[id] = Alias{ID: id}
	}
	for id, r := range c.roles {
		aliases := map[string]string{}
		for _, a := range r.Aliases {
			if !assetID.MatchString(a.ID) || a.Domain == "" {
				return nil, fmt.Errorf("%w: catalog.json role %q alias %q", ErrBundle, id, a.ID)
			}
			if _, dup := aliases[a.ID]; dup {
				return nil, fmt.Errorf("%w: catalog.json role %q alias %q twice", ErrBundle, id, a.ID)
			}
			aliases[a.ID] = a.Domain
		}
		seen := map[string]bool{}
		for _, name := range r.PriorIDs {
			if !assetID.MatchString(name) || seen[name] {
				return nil, fmt.Errorf("%w: catalog.json role %q prior id %q", ErrBundle, id, name)
			}
			seen[name] = true
			if name != id {
				if _, ok := aliases[name]; !ok {
					return nil, fmt.Errorf("%w: catalog.json role %q prior id %q is no alias", ErrBundle, id, name)
				}
			}
		}
		for name, domain := range aliases {
			if _, taken := c.names[name]; taken {
				return nil, fmt.Errorf("%w: catalog.json alias %q shadows a name", ErrBundle, name)
			}
			c.names[name] = Alias{ID: id, Domain: domain}
		}
	}
	return c, nil
}

// Resolve maps a canonical id or alias to its role and domain. Only a role
// whose prior state is supported resolves; planned and unsupported refuse,
// through aliases too (Prior answer 67.2).
func (c *Catalog) Resolve(name string) (Role, string, error) {
	ref, ok := c.names[name]
	if !ok {
		return Role{}, "", fmt.Errorf("%w: role %q is not in the catalog", ErrBundle, name)
	}
	role := c.roles[ref.ID]
	if role.Support["prior"] != "supported" {
		return Role{}, "", fmt.Errorf("%w: role %q is %s on prior", ErrBundle, name, role.Support["prior"])
	}
	return role, ref.Domain, nil
}

// LoadProfile decodes profiles/<id>.json with Prior's checks on the policy
// fields and the tool names.
func LoadProfile(b *Bundle, id string) (Profile, error) {
	body, err := b.Asset("profiles/" + id + ".json")
	if err != nil {
		return Profile{}, err
	}
	var p Profile
	if decodeExact(body, &p, "id", "input_schema", "result_schema", "tools_ceiling", "may_delegate", "writes_workbench", "execution_policy") != nil || p.ID != id || p.ToolsCeiling == nil || len(p.WritesWorkbench) != 2 || len(p.ExecutionPolicy) != 2 || p.ExecutionPolicy["prior"] != "prior-enforced" || p.ExecutionPolicy["claude-code"] != "claude-guided" {
		return Profile{}, fmt.Errorf("%w: profiles/%s.json", ErrBundle, id)
	}
	for _, host := range []string{"prior", "claude-code"} {
		if _, ok := p.WritesWorkbench[host]; !ok {
			return Profile{}, fmt.Errorf("%w: profiles/%s.json writes_workbench.%s", ErrBundle, id, host)
		}
	}
	seen := map[string]bool{}
	for _, tool := range p.ToolsCeiling {
		switch tool {
		case "read", "list", "search", "create", "write", "rename", "delete", "process", "runtime-inspect", "git-inspect":
		default:
			return Profile{}, fmt.Errorf("%w: profiles/%s.json tool %q", ErrBundle, id, tool)
		}
		if seen[tool] {
			return Profile{}, fmt.Errorf("%w: profiles/%s.json tool %q twice", ErrBundle, id, tool)
		}
		seen[tool] = true
	}
	return p, nil
}

// LoadWorkflow decodes a workflow definition: five keys, every step naming
// exactly one of role and host_service with non-empty hand-over and
// completion objects, requires unique.
func LoadWorkflow(b *Bundle, path string) (Workflow, error) {
	body, err := b.Asset(path)
	if err != nil {
		return Workflow{}, err
	}
	var w Workflow
	if decodeExact(body, &w, "id", "capability", "steps", "revise_bound", "requires") != nil || w.ID == "" || w.Capability == "" || len(w.Steps) == 0 || w.ReviseBound < 0 || w.Requires == nil {
		return Workflow{}, fmt.Errorf("%w: %s", ErrBundle, path)
	}
	ids := map[string]bool{}
	for _, s := range w.Steps {
		if s.ID == "" || ids[s.ID] || (s.Role == "") == (s.HostService == "") || len(s.InputFrom) == 0 || len(s.Completion) == 0 {
			return Workflow{}, fmt.Errorf("%w: %s step %q", ErrBundle, path, s.ID)
		}
		ids[s.ID] = true
	}
	seen := map[string]bool{}
	for _, name := range w.Requires {
		if seen[name] {
			return Workflow{}, fmt.Errorf("%w: %s requires %q twice", ErrBundle, path, name)
		}
		seen[name] = true
	}
	return w, nil
}

// Declares reports whether the workflow's requires list names every given
// host service. The module performs no preflight against the host (Prior
// answer 67.6: the host compares requires with its service map before the
// process starts); this checks the definition's own consistency, that the
// services a workflow executor will call are the ones the definition declares.
func (w Workflow) Declares(names ...string) bool {
	have := map[string]bool{}
	for _, name := range w.Requires {
		have[name] = true
	}
	for _, name := range names {
		if !have[name] {
			return false
		}
	}
	return true
}

// RoleCapabilities are the three durable role services of module API v1.
var RoleCapabilities = []string{api.RoleReadCapability, api.RoleRunCapability, api.RoleCompleteCapability}
