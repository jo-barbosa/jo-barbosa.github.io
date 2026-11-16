# jo-barbosa.github.io

Online CV, served at https://jo-barbosa.github.io. Plain HTML, CSS and JS, no build step.

- `index.html`, `style.css`, `script.js`: the site. Content is copied from the base CV; update it by hand when the base CV changes.
  Project tech tags (`.tags`) drive the filters; a skill chip is clickable when its `data-tag` matches a project tag.
- `Jorge_Barbosa_CV.pdf`: public PDF (no phone number), built from the base CV:

  ```bash
  ./build-pdf.sh            # defaults to ../CV/CV_General
  ```
