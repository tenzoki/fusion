---
description: Steer a campaign over the checkouts of one project. Show which checkout holds which work package at the commit the remote stands at, when it last pushed, what the package waits for and how each lane stands, read out of a fetched ref; propose the cut of the live packages into lanes; open, pause, resume or end a campaign, move a package or reassign a lane. Use when the user asks who is working on what across checkouts, or wants to steer a campaign.
argument-hint: "[overview [--window <hours>] | cut --checkouts <N> | lanes | open | pause | resume | move | reassign | end]"
allowed-tools: [Bash, Read, AskUserQuestion]
---
