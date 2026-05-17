#!/usr/bin/env python3
"""Simple test runner for CVBER backend tests."""

import sys
import subprocess


def main():
    import pytest

    args = [
        "tests/",
        "-v",
        "--tb=short",
        "--no-header",
    ]

    if "-k" in sys.argv:
        args.extend([sys.argv[sys.argv.index("-k") + 1]])

    sys.exit(pytest.main(args + sys.argv[1:]))


if __name__ == "__main__":
    main()
