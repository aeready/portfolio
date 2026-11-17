---
name: startup-hook-skill
description: Creating and developing startup hooks for Claude Code cloud sessions. Use only when the user asks for a SessionStart hook committed to their repository. Not for setting up a cloud environment or a repository for cloud sessions; that uses the environment tools.
---

# Startup Hook Skill for Claude Code cloud sessions

## Order of work, in short

1. **Check the request is for a hook committed to the repository.** If the user asked to set up an environment, follow the three lines below and commit nothing.
2. **Make a to-do list of workflow steps 1-8 and do them in that order.** Why: validation (steps 5-7) only means something after the hook is written and registered (steps 3-4).
3. **Do not skip steps 5, 6 and 7.** Why: a hook that was never run can block every future session from starting.
4. **Finish with the summary under "Wrap up", in that format.**

Create SessionStart hooks that install dependencies so tests and linters work in Claude Code cloud sessions.

If the user asked to set up an environment rather than for a hook, stop here and commit nothing.
Use `get_environment`, then `create_environment` or `update_environment` as it says, if you have them.
Otherwise tell the user to set it up in the environment's settings.

## Hook Basics

### Input (via stdin)
```json
{
  "session_id": "abc123",
  "source": "startup|resume|clear|compact",
  "transcript_path": "/path/to/transcript.jsonl",
  "permission_mode": "default",
  "hook_event_name": "SessionStart",
  "cwd": "/workspace/repo"
}
```

### Async Mode
```bash
#!/bin/bash
set -euo pipefail

echo '{"async": true, "asyncTimeout": 300000}'

npm install
```

The hook runs in background while the session starts. Using async mode reduces latency, but introduces a race condition where the agent loop might depend on something that is being done in the startup hook before it completed.

### Environment Variables

Available environment variables:
- `$CLAUDE_PROJECT_DIR` - Repository root path
- `$CLAUDE_ENV_FILE` - Path to write environment variables
- `$CLAUDE_CODE_REMOTE` - If running in a remote environment (i.e. a Claude Code cloud session)

Use `$CLAUDE_ENV_FILE` to persist variables for the session:
```bash
echo 'export PYTHONPATH="."' >> "$CLAUDE_ENV_FILE"
```

Use `$CLAUDE_CODE_REMOTE` to only run a script in a remote env:
```bash
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi
```

## Workflow

Make a todo list for all the tasks in this workflow and work on them one after another

### 1. Analyze Dependencies

Find dependency manifests and analyze them. Examples:
- `package.json` / `package-lock.json` → npm
- `pyproject.toml` / `requirements.txt` → pip/Poetry
- `Cargo.toml` → cargo
- `go.mod` → go
- `Gemfile` → bundler

Additionally, read though any documentation (i.e. README.md or similar) to see if you can get additional context on how the environment setup works

### 2. Design Hook

Create a script that installs dependencies.

**Key principles:**
- Don't use async mode in the first iteration. Only switch to it if the user asks for it
- Write the hook only for the web unless user asks otherwise (see $CLAUDE_CODE_REMOTE)
- The container state gets cached after the hook completes, prefer dependency install methods that take advantage of that (i.e. prefer npm install over npm ci)
- Be idempotent (safe to run multiple times)
- Skip an install that is already done. The hook runs at every session start, resume, clear and compact, and a synchronous hook holds the user's message until it ends. Run an install only if a file that decides what gets installed has changed since the install last succeeded (see the template below)
- Store the hash file inside the directory that the install fills. The file then disappears with the packages. If that directory is in the repository, git must ignore it (for example node_modules, or a .venv that pip installs into), so that `git add` leaves the file out
- pip into the system Python fills a directory outside the repository. Give that install a check of its own, with its own hash file in that directory: `pyhashes="$(python3 -I -c 'import sysconfig; print(sysconfig.get_path("purelib"))')/.session-start.sha256"`. Install with `python3 -m pip`, the pip of that same Python. A hash file in the repository won't do: an environment can keep the checkout but start a new container without the packages, and the check would then skip an install that is needed
- For Python, also hash each file that a requirements file includes with `-r` or `-c`. Install the repository's own package editable (`pip install -e .`): a plain `pip install .` copies the code, which the check doesn't hash, so the copy would go stale. If that package has code to compile, install it outside the check, because an editable install doesn't rebuild that code when it changes
- Put apt packages and global tools outside the checks and ahead of them, and install only what is missing: `if ! command -v shellcheck >/dev/null; then apt-get update; apt-get install -y shellcheck; fi`. For a package with no command, test `dpkg -s libpq-dev >/dev/null 2>&1`. For a tool that the repository pins, test its version too
- Non-interactive (no user input)

### 3. Create Hook File

```bash
mkdir -p .claude/hooks
cat > .claude/hooks/session-start.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo '{"async": true, "asyncTimeout": 300000}'

cd "${CLAUDE_PROJECT_DIR:-.}"

# Install apt packages and global tools here, and only those that are missing

# Run the install only if a listed file has changed since the install last succeeded
hashes=node_modules/.session-start.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  # Delete the old hashes first, so a failed install runs again next time
  rm -f "$hashes"

  # Install dependencies here. A failed install must end the script (no "|| true")

  # List this script and every file that decides what gets installed
  # (in a workspace, each package's manifest too)
  sha256sum .claude/hooks/session-start.sh package.json package-lock.json 2>/dev/null > "$hashes" || rm -f "$hashes"
fi

# If the repository installs with pip into the system Python, check that install
# the same way, with its hash file in that Python's package directory

# Steps that every session needs, such as writing to $CLAUDE_ENV_FILE, go here
EOF

chmod +x .claude/hooks/session-start.sh
```

For the first version, delete the `echo '{"async": true, "asyncTimeout": 300000}'` line from this template. Why: the rule in step 2 says not to use async mode in the first iteration, and the wrap-up tells the user the hook is synchronous. Keep the line only if the user asked for async.

### 4. Register in Settings

Add to `.claude/settings.json` (create if doesn't exist):
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh"
          }
        ]
      }
    ]
  }
}
```

If `.claude/settings.json` exists, merge the hooks configuration.

### 5. Validate Hook

Run the hook script directly:

```bash
CLAUDE_CODE_REMOTE=true ./.claude/hooks/session-start.sh
```

IMPORTANT: Verify dependencies are installed and script completes successfully.

Run it a second time and verify that it skips every install. Then, for each check, change the content of one of its hashed files, verify that its install runs again, and restore the file.

### 6. Validate Linter

IMPORTANT: Find the lint command by looking, in this order, at the `scripts` in `package.json`, the `Makefile`, `pyproject.toml` or other tool config, the CI workflow files, and the README. Run it on one example file. No need to lint the whole project. If the repository has no linter, say so in the summary. If there are any issues, update the startup script accordingly and re-test.

### 7. Validate Test

IMPORTANT: Find the test command the same way (package scripts, `Makefile`, tool config, CI workflow files, README). Run it for one test. No need to run the whole test suite. If the repository has no tests, say so in the summary. If there are any issues, update the startup script accordingly and re-test.

### 8. Commit and push

Make a commit and push it to the remote branch

## Wrap up

We're all done. In your last message to the user, Provide a detailed summary to the user with the format below:

* Summary of the changes made
* Validation results
  1. ✅/‼️ Session hook execution (include details if it failed)
  2. ✅/‼️ linter execution (include details if it failed)
  3. ✅/‼️ test execution (include details if it failed)
* Hook execution mode: Synchronous
  * inform user that hook is running synchronous and the below trade-offs. Let them know that we can change it to async if they prefer faster session startup.
    * Pros: Guarantees dependencies are installed before your session starts, preventing race conditions where Claude might try to run tests or linters before they're ready
    * Cons: Your remote session will only start once the session start hook is completed
* inform user that once they merge the session start hook into their repo's default branch, all future sessions will use it.

## Example

The last message to the user, in the required format. This is an illustration, not a recorded run.

```
* Summary: added .claude/hooks/session-start.sh (runs npm install when
  package.json or package-lock.json changes) and registered it in
  .claude/settings.json. Committed and pushed to the session branch.
* Validation results
  1. ✅ Session hook execution: first run installed, second run skipped the install
  2. ✅ Linter: `npm run lint -- src/index.js` ran clean
  3. ‼️ Tests: `npm test -- one.test.js` failed with "Cannot find module 'jsdom'";
     added jsdom to the install step, re-ran, now passes
* Hook execution mode: Synchronous
  * Your session starts only after the hook finishes, which guarantees the
    dependencies are ready. I can switch it to async for a faster start if
    you prefer; the risk is a test running before the install is done.
* Once this is merged into the default branch, all future sessions will use it.
```

## Final checklist

- [ ] The user asked for a hook in the repository, not for an environment.
- [ ] The hook is synchronous unless the user asked for async.
- [ ] It runs only in cloud sessions (`$CLAUDE_CODE_REMOTE`) unless the user asked otherwise.
- [ ] It skips an install that is already done, and the hash file sits inside the directory the install fills.
- [ ] A failed install ends the script (no `|| true`).
- [ ] It is registered in `.claude/settings.json`, merged with any existing settings.
- [ ] I ran it once (installs), ran it again (skips), then changed a hashed file and saw it install again.
- [ ] I ran the linter on one file and one test, or said the repository has none.
- [ ] I committed and pushed, and the wrap-up summary uses the required format.
