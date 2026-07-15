# Contributing to CVBER

CVBER is currently maintained by Ayush Gupta. Contributions, bug reports, and product feedback are welcome.

## How to Contribute

1. **Open an issue first** for large changes. This lets us discuss the approach before you spend time coding.
2. **Fork the repo** and create a feature branch.
3. **Make your changes** with clear commit messages.
4. **Run verification** before pushing:

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd ../backend
python -m pytest tests/ -v
```

5. **Submit a pull request** with a clear description of what changed and why.

## Development Setup

See the [README](README.md#local-development) for setup instructions.

## Code Style

- **Python:** Follow existing patterns. Use `logging` instead of `print()`. Never use bare `except:`.
- **TypeScript:** Follow existing patterns. Use proper error handling instead of empty `catch {}` blocks.
- **Commits:** Write clear, descriptive commit messages. Example: "Add evidence ZIP generation flow" not "fix" or "update".

## What We're Looking For

- Bug fixes
- Documentation improvements
- Test coverage
- Accessibility improvements
- Performance improvements

Please do not submit:
- Changes that add new dependencies without discussion
- Changes that break the existing API
- AI-generated code without human review

## Questions?

Open a GitHub issue with the `question` label.
