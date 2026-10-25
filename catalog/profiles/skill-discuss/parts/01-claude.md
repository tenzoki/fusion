---
description: Runs a bounded discussion between the agent the user is talking to and the consultant, round by round in the chat, with a claim register that is written to the workbench's discussion store from the first round onward. Begins, inspects and closes a discussion; decides nothing.
argument-hint: "[--begin <reference>] [--infer] [--close]"
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion, Agent(fusion:consultant)]
---
