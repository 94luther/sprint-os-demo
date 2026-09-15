# Sprint OS shared brand fonts

Nothing needs downloading for the Sprint OS apps to look right. Every screen
already looks correct today, with a plain system font standing in for the
brand type. This folder only exists to restore the exact brand faces for
offline use, whenever someone gets around to it.

Drop in these two files and every app picks them up automatically, with no
restart and no other change:

- `Anton-Regular.woff2`, the bold display face used for headings and big
  numbers
- `Inter-Variable.woff2`, the body face used for everything else (it should
  cover weights 400 through 800 in one variable file)

If the files on hand are TTF instead of WOFF2, that is fine too: name them
`Anton-Regular.ttf` and `Inter-Variable.ttf` and drop them in the same way.
Each app tries the WOFF2 name first, then the TTF name, then falls back to a
plain system font, so a missing or partial set never breaks a screen.

Save the files straight into this folder, `apps/shared/fonts/`, next to this
README. That is the whole job.
