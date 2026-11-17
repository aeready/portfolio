# Prompt library

Where these came from: no file in this repository stores prompts word for word.
These are the requests that show up again and again in `CHANGELOG.md`,
`CLAUDE.md`, `AGENTS.md` and `scripts/qa/README.md`, written out once so they
can be pasted. Section D holds the three prompts that are written out in full
inside the installed skills, and section E the ones from the Fable last-day
session (17 Nov 2026).

Fill in every `[bracket]` before sending. Delete a bracket line you do not need.

---

## A. Portfolio site: finding problems

### A1. Read-only audit
**Use when:** you want a list of what is wrong before anything is changed.

```
Audit [the whole site / the page or section] without changing any files.
Check English and Korean, on a Galaxy S9+ phone, a tablet ([820] px) and a
desktop ([1440] px).
Look for: [overlap, cut-off text, sideways scroll, text under 12 px, weak
contrast, things that behave differently from the rest of the site].
Give me a numbered list, most serious first. For each item: what I would see,
where, on which screen sizes, and a screenshot. Mark each High, Medium or Low.
Do not fix anything yet. End with the questions only I can answer.
```

**A good answer:** numbered items with codes (H1, M3, L2), each with a place, a
screen size and a screenshot; nothing edited; a short list of decisions for you.

### A2. "Is this already fixed?"
**Use when:** you saw a problem on the live site on your phone, and the live site may be behind.

```
On my Galaxy phone in Chrome I see: [what looks wrong] on [page / section],
in [English / Korean].
First check the current code and take a screenshot with the Galaxy S9+
emulation. Tell me whether this is already fixed in the code and just not
uploaded, or still broken. Do not change anything until you have told me which.
```

**A good answer:** one clear verdict ("already fixed, needs upload of X" or
"still broken, cause is Y") with a screenshot, before any edit.

---

## B. Portfolio site: making changes

### B1. Apply fixes from an audit
**Use when:** you have an audit list and have decided which items to do.

```
Apply these audit items: [H1, H2, M3 ...]. My decisions: [item: choice, ...].
Follow CLAUDE.md and AGENTS.md. New styles go in a dated block at the end of
web/edition.css. Every visible text change in both English and Korean.
When done: run all the checks in CLAUDE.md, show before/after screenshots
(Galaxy S9+ and desktop), add a CHANGELOG.md entry with how to undo it, and
list the files I need to upload.
Work on [a branch / main]. Do not push to main unless I said main.
```

**A good answer:** each item marked done or not done with the reason; before/after
screenshots; validator results quoted; a changelog entry with an Undo line; an
exact upload list.

### B2. One visual fix
**Use when:** a single thing looks wrong and you know what you want.

```
Fix this: [what is wrong], on [page / section], [phone / tablet / desktop],
[English / Korean / both].
What I want instead: [the result you want].
Do not change anything else. Read docs/overhaul/OWNER_DECISIONS.md first and
tell me if my request goes against a decision already made.
Show before/after screenshots on Galaxy S9+ and desktop, run the checks, add
the changelog entry and tell me which files to upload.
```

**A good answer:** one small change, both screenshots, checks passing, no other
part of the page moved.

### B3. Change or add wording (English + Korean)
**Use when:** any text on the site changes.

```
Change the text [where it is] from "[current English]" to "[new English]".
Korean: [your Korean / "suggest one and mark it as needing a native check"].
Update both languages in web/locales.js (and web/projects.js if it is project
text). Run python3 scripts/check-korean-font.py. If a syllable is missing,
rebuild the font, or if that is blocked, suggest wording that uses syllables
already in the font. Tell me whether the three font files need re-uploading.
```

**A good answer:** both strings shown side by side; the font check result; a
plain yes or no on re-uploading fonts; suggested Korean flagged for checking.

### B4. Add or update a project
**Use when:** a new project, or new facts or files for an existing one.

```
[Add a new project / Update the project "[name]"].
Title: [English] / [Korean]
My role: [text]
Brief: [text]
What it includes: [text]
Files: [file names, and where they are]
Position in the list: [number]
Use only the facts I gave. Add no outcomes, credentials or testimonials.
Keep original files byte for byte. Update validate.mjs if the project order
changes. Build the previews, run the checks, show screenshots in both
languages, and list the files to upload.
```

**A good answer:** the project appears in both languages with nothing invented;
originals untouched; previews built; validators pass; upload list included.

### B5. Undo a change
**Use when:** you do not like a round of changes.

```
Undo the changelog entry "[entry title and date]". Follow that entry's own
Undo line. Then run the checks, show a screenshot proving it is back to how
it was, and tell me which files to upload.
```

**A good answer:** only that entry reversed; a screenshot matching the earlier
state; the changelog updated to say it was undone.

---

## C. Portfolio site: before uploading

### C1. Pre-upload check and file list
**Use when:** you are about to upload and publish.

```
I am about to upload. Run every check in CLAUDE.md and the phone checks in
scripts/qa/README.md. Then give me:
1. each check and whether it passed (show the output of any that failed);
2. the exact list of files changed since [the last upload / commit or date];
3. whether the Korean font files changed;
4. anything I should look at on my phone after publishing.
Do not push or publish anything.
```

**A good answer:** a pass/fail line per check with real output; a file list you
can tick off; nothing pushed.

### C2. Explain it simply
**Use when:** a reply was too technical.

```
Explain [the change / the problem] in plain language, as if to someone who
does not code: what I would have seen before, what I will see now, and what I
have to do. No file names unless I need to upload them. Under [100] words.
```

**A good answer:** before / now / your job, in everyday words, within the limit.

---

## D. Prompts that live inside installed skills

### D1. Export memories from another assistant (from the import-memory skill)
**Use when:** moving what ChatGPT or Gemini remembers about you into Claude. Paste this into the other assistant, then paste its answer back to Claude.

```
Export all of my stored memories and any context you've learned about me from past conversations. Preserve my words verbatim where possible, especially for instructions and preferences.

## Categories (output in this order):

1. **Instructions**: Rules I've explicitly asked you to follow going forward — tone, format, style, "always do X", "never do Y", and corrections to your behavior. Only include rules from stored memories, not from conversations.

2. **Identity**: Name, age, location, education, family, relationships, languages, and personal interests.

3. **Career**: Current and past roles, companies, and general skill areas.

4. **Projects**: Projects I meaningfully built or committed to. Ideally ONE entry per project. Include what it does, current status, and any key decisions. Use the project name or a short descriptor as the first words of the entry.

5. **Preferences**: Opinions, tastes, and working-style preferences that apply broadly.

## Format:

Use section headers for each category. Within each category, list one entry per line, sorted by oldest date first. Format each line as:

[YYYY-MM-DD] - Entry content here.

If no date is known, use [unknown] instead.

## Output:
- Wrap the entire export in a single code block for easy copying.
- After the code block, state whether this is the complete set or if more remain.
```

**A good answer:** one code block, five headed sections, one dated line per
entry, and a closing line saying whether it is complete.

### D2. Morning brief (from the morning skill)
**Use when:** you want the one-page view of your day.

```
/morning
[Include action buttons]
[Sections: topic one, topic two]
```

**A good answer:** one page: a line drawing of the day with three time blocks,
then "Needs attention" and "Resolved" lists, each item linked to its source.
Buttons appear only if the exact words "Include action buttons" were sent.

### D3. Research report (from the deep-research skill)
**Use when:** a question needs several sources and a written report.

```
Research [topic]. I need: [what the report must answer].
Key questions:
- [question 1]
- [question 2]
Prefer these sources: [types of source].
Limits: [time period, country or region, anything to leave out].
```

**A good answer:** a report file with sources, covering each key question inside
the limits you set, plus a 3-5 sentence summary saying where the file is.

---

## E. Working with Claude itself

### E1. Score and sharpen a skill
**Use when:** a skill gives uneven results, or a cheaper model will run it.

```
Score [path to SKILL.md] out of 10 for how well a cheaper model could follow
it. Quote the lines that would trip it up (vague words, unordered steps, rules
with no reason, no example, no final check).
Then rewrite it so that: the description says exactly when to use it; each
step is one action, in order; each rule says why in one line; it shows one
real example output; it ends with a checklist.
Keep what the skill does the same. Back up the original as SKILL.md.bak first.
Show me before, after and the new score, and wait for my yes.
```

**A good answer:** a score with quoted lines, a backup made, a rewrite that does
the same job, and a stop for your approval.

### E2. Fix the instructions, not the output
**Use when:** another model ran a skill and the result was off.

```
I ran the skill [name] on [model] with this request: [the request].
Here is what it produced: [paste the output].
What I expected instead: [what was wrong or missing].
Do not fix the output. Find the line in the skill's instructions that allowed
this, change the instructions so it cannot happen again, and show me the
change as before/after.
```

**A good answer:** it names the exact instruction (or the gap) that caused the
problem, shows a small before/after edit to the skill, and leaves the output alone.

### E3. Step-by-step task with stops
**Use when:** a job has several stages and you want control between them.

```
Do these in order, one step at a time: [step 1], [step 2], [step 3].
Ask me before anything that needs a sign-in, key or payment, and before
anything that deletes or publishes.
After [step N], show me the result and wait for my yes.
If a step fails, tell me in plain English what happened and what my choices are.
End with a short list: what you made, where each file is, what I still have to do.
```

**A good answer:** steps done in the stated order, a real pause where you asked
for one, failures reported plainly, and the closing list.
