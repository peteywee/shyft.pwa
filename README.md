# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Troubleshooting

### Git: refusing to merge unrelated histories

If you encounter the `fatal: refusing to merge unrelated histories` error when pulling from a remote repository, it means your local repository and the remote one don't share a common commit history.

To resolve this, you can use the `--allow-unrelated-histories` flag with your pull command. This tells Git to proceed with combining the two histories.

Run the following command in your terminal:

```bash
git pull origin main --allow-unrelated-histories
```

After running this command, Git will create a merge commit, and you should be able to push and pull as usual.
