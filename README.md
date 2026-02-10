# Easy Paper Importer for Obsidian 📚

**Easy Paper Importer** is an easy way import paper metadata from a DOI into Obsidian for note taking and literature management.

This plugin was partially coded with GitHub Copilot to save time (e.g. get basics up and running + allowing for easier learning curve). Generated code is reviewed as needed. Use at your own discretion and report any issues you find.

## Why?

I could not find a paper importer that worked how I wanted it to.

## Summary

- Input a DOI
- Meta data is fetched from the CrossRef API (`https://api.crossref.org/works/{doi}`).
- Creates a note in a user-defined folder (default: `Papers/`) with:
    - YAML frontmatter (title, authors, doi, pdf link, tags)

> Note: This plugin does **not** currently download paper PDFs

## To Do

1. Note template: allow for user-defined note template
2. PDF downloading: via affiliation login (?)

## Installation (dev)

1. Clone this repo into `<Vault>/.obsidian/plugins/easy-paper-importer`.
2. `npm install` + 'npm run dev` as shown in https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin

Note: Plugins can always modify your files, use with caution in case of any issues.
