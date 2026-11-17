---
name: pdf
description: Use this skill whenever the user mentions a .pdf file or asks to produce one. Covers exactly these jobs - read or extract text, extract tables, merge, split, rotate pages, read metadata, create a new PDF, add a watermark, extract images, add or remove a password, OCR a scanned PDF, and fill in a PDF form. Read it before writing any PDF code. For filling a form, read FORMS.md in this folder first and follow it instead of the recipes here.
license: Complete terms in LICENSE.txt
---

# PDF Processing Guide

Follow the six steps in order. The recipes further down are the code for step 5.

Other files in this folder:
- `FORMS.md`: the full procedure for filling in a PDF form. If the job is a form, read it now and follow it.
- `REFERENCE.md`: advanced pypdfium2 usage, JavaScript libraries (pdf-lib), detailed examples and troubleshooting. Read it only when a recipe below does not cover the job or fails.

## Steps

1. **Name the job.** Match the request to one row of the table in step 2. If it matches none, read `REFERENCE.md`.
   Why: each job has one best tool; picking by habit gives worse output (for example pypdf for tables).

2. **Pick the tool from this table.**

   | Job | Tool | Recipe |
   |---|---|---|
   | Read text | pdfplumber (or `pdftotext` on the command line) | R5, R11 |
   | Extract tables | pdfplumber | R6, R7 |
   | Merge | pypdf (or `qpdf`) | R1, R12 |
   | Split | pypdf (or `qpdf`) | R2, R12 |
   | Rotate pages | pypdf (or `qpdf`) | R4, R12 |
   | Read metadata | pypdf | R3 |
   | Create a new PDF | reportlab | R8, R9, R10 |
   | Add a watermark | pypdf | R15 |
   | Extract images | `pdfimages` | R16 |
   | Add a password | pypdf | R17 |
   | Remove a password | `qpdf` | R12 |
   | OCR a scanned PDF | pytesseract + pdf2image | R14 |
   | Fill a form | see `FORMS.md` | not here |

3. **Check the tool is installed** before writing the script: `python3 -c "import pypdf"` for a library, `command -v qpdf` for a command.
   Why: `qpdf`, `pdftk`, `pytesseract` and `pdf2image` are often missing. If one is missing, use the other tool in the same table row, or install it (`pip install pytesseract pdf2image`).

4. **Look at the input first.** Run R0 to print the page count and the first 200 characters of page 1.
   Why: the page count is what you will check against later, and empty text means the PDF is a scan, so text and table recipes will return nothing and you need OCR (R14).

5. **Run the recipe, writing to a new file name.** Never write over the input file.
   Why: a failed write would destroy the user's original, and you need the original to compare against.

6. **Check the output, then report.** Do all three:
   1. Open the output with `PdfReader` and print its page count. Compare with what you expect (merge: the sum of the inputs; split: one file per page; rotate, watermark, password: the same as the input).
   2. Look at one page: `pdftoppm -jpeg -r 50 -f 1 -l 1 output.pdf page`, then read the image. Page numbers are zero-padded to the width of the page count (`page-01.jpg` for a 59-page file).
   3. For extracted text or tables, print the first few lines and confirm they are real words and rows, not empty strings or `None`.

   Why: these libraries write a file without complaint even when the pages are blank, sideways, or missing.
   Then tell the user the output file name, the page count, and what you checked.

## Rules

- **Write to a new file, never over the input.** Why: keeps the original safe if the result is wrong.
- **Never use Unicode subscript or superscript characters (₀₁₂₃₄₅₆₇₈₉, ⁰¹²³⁴⁵⁶⁷⁸⁹) in reportlab.** Why: the built-in fonts lack these glyphs, so they print as solid black boxes. Use `<sub>` and `<super>` tags in a `Paragraph` (R10). For text drawn on a canvas, change the font size and position by hand instead.
- **Use pdfplumber, not pypdf, for tables.** Why: pdfplumber returns rows and cells; pypdf returns plain text with the columns lost.
- **Use `pdftk` only if `command -v pdftk` finds it.** Why: it is frequently not installed; pypdf and `qpdf` do the same jobs.
- **Empty text from every page means a scanned PDF: switch to OCR (R14).** Why: a scan is a picture of text, so there is no text layer to extract.
- **For forms, follow `FORMS.md`, not these recipes.** Why: forms need field detection and position checks that the recipes here do not do.
- **Do not report success from "the script ran".** Why: see step 6; report the page count and what you saw.

## Example

Request: "Merge advice-suggestions.pdf and reading-for-meaning.pdf into one file."

Steps 1-2: the job is Merge, the tool is pypdf, the recipe is R1. Step 3: `import pypdf` works. Steps 4-6, real output:

```
advice-suggestions.pdf 27 pages
reading-for-meaning.pdf 32 pages
merged.pdf 59 pages (expected 59)
first words of last page: 'Research andResearch andResearch and\nteaching sourcesteachin'
page-01.jpg
```

Report to the user:

```
Done: merged.pdf, 59 pages (27 + 32), in the order you gave. I reopened it and
checked the page count, that the last page still has its text, and that page 1
displays the right way up. Your two original files are unchanged.
```

## Recipes

### R0. Look at a PDF
```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")
print(repr((reader.pages[0].extract_text() or "")[:200]))
```

To get all the text with pypdf:
```python
text = ""
for page in reader.pages:
    text += page.extract_text()
```

### pypdf

#### R1. Merge
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### R2. Split (one file per page)
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### R3. Metadata
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Title: {meta.title}")
print(f"Author: {meta.author}")
print(f"Subject: {meta.subject}")
print(f"Creator: {meta.creator}")
```

#### R4. Rotate
```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # 90 degrees clockwise
writer.add_page(page)

with open("rotated.pdf", "wb") as output:
    writer.write(output)
```

### pdfplumber

#### R5. Text with layout
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### R6. Tables
```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

#### R7. All tables into one Excel file
```python
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:  # skip empty tables
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

if all_tables:
    combined_df = pd.concat(all_tables, ignore_index=True)
    combined_df.to_excel("extracted_tables.xlsx", index=False)
```

### reportlab

#### R8. One simple page
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

c.drawString(100, height - 100, "Hello World!")
c.drawString(100, height - 120, "This is a PDF created with reportlab")
c.line(100, height - 140, 400, height - 140)
c.save()
```

#### R9. A document with several pages
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

title = Paragraph("Report Title", styles['Title'])
story.append(title)
story.append(Spacer(1, 12))

body = Paragraph("This is the body of the report. " * 20, styles['Normal'])
story.append(body)
story.append(PageBreak())

story.append(Paragraph("Page 2", styles['Heading1']))
story.append(Paragraph("Content for page 2", styles['Normal']))

doc.build(story)
```

#### R10. Subscripts and superscripts
```python
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

styles = getSampleStyleSheet()

chemical = Paragraph("H<sub>2</sub>O", styles['Normal'])
squared = Paragraph("x<super>2</super> + y<super>2</super>", styles['Normal'])
```

### Command line

#### R11. pdftotext (poppler-utils)
```bash
pdftotext input.pdf output.txt            # extract text
pdftotext -layout input.pdf output.txt    # keep the layout
pdftotext -f 1 -l 5 input.pdf output.txt  # pages 1-5 only
```

#### R12. qpdf
```bash
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf     # merge
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf               # split
qpdf input.pdf --pages . 6-10 -- pages6-10.pdf
qpdf input.pdf output.pdf --rotate=+90:1                   # rotate page 1 by 90 degrees
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf   # remove password
```

#### R13. pdftk (only if installed)
```bash
pdftk file1.pdf file2.pdf cat output merged.pdf   # merge
pdftk input.pdf burst                             # split
pdftk input.pdf rotate 1east output rotated.pdf   # rotate
```

### Other jobs

#### R14. OCR a scanned PDF
```python
# Requires: pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

images = convert_from_path('scanned.pdf')

text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"

print(text)
```

#### R15. Watermark
```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]  # create or load the watermark page

reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

#### R16. Extract images
```bash
pdfimages -j input.pdf output_prefix
# writes output_prefix-000.jpg, output_prefix-001.jpg, ...
```

#### R17. Add a password
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

writer.encrypt("userpassword", "ownerpassword")

with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```

## Final checklist

Confirm every line before telling the user it is done. If one is false, go back to that step.

- [ ] The job matched one row of the table, or I read `REFERENCE.md` (forms: `FORMS.md`).
- [ ] I checked the tool was installed before using it.
- [ ] I printed the input's page count and first text before changing anything.
- [ ] The output has a new file name; the input file is unchanged.
- [ ] I reopened the output and its page count is what I expected.
- [ ] I rendered at least one page and looked at it (or, for text and tables, read the first lines).
- [ ] No Unicode subscript or superscript characters in any reportlab text.
- [ ] My message names the output file, its page count, and what I checked.
