# D2L Deployment Pipeline helper #

On every push to *deployD2L* branch only:

1. GitHub Actions checks out repo
1. Runs a Playwright script
1. Logs into Brightspace using CREDENTIALS
1. Navigates to Manage Files
    > /content/enforced/7541-ViennaLySandbox/CPB Key Processes
1. Uploads all .html files in the repo root; the entire .src/ folder. Overwrites existing files.

## GITHUB Set up ##

This requires workflow yml and setting up `D2L_USERNAME` and `D2L_PASSWORD` secrets in the repo.
