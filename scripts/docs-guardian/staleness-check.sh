#!/usr/bin/env bash

# docs-guardian staleness check
#
# Compares git modification dates between source files and their
# corresponding doc files using convention-based matching.
#
# Output: TSV with columns:
#   source_file  doc_file  source_date  doc_date  days_behind
#
# Usage: bash staleness-check.sh [project_root]

set -euo pipefail

PROJECT_ROOT="${1:-$(pwd)}"
CONFIG_PATH="$PROJECT_ROOT/.claude/docs-guardian/config.json"

if [ ! -f "$CONFIG_PATH" ]; then
  echo "Error: Config not found at $CONFIG_PATH" >&2
  echo "Run /docs-guardian:init first." >&2
  exit 1
fi

# Check if we're in a git repo
if ! git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree &>/dev/null; then
  echo "Error: Not a git repository" >&2
  exit 1
fi

# Function to get last modified date of a file from git (epoch seconds)
git_last_modified() {
  local file="$1"
  local date
  date=$(git -C "$PROJECT_ROOT" log -1 --format="%ct" -- "$file" 2>/dev/null)
  if [ -z "$date" ]; then
    echo "0"
  else
    echo "$date"
  fi
}

# Function to calculate days between two epoch timestamps
days_between() {
  local newer="$1"
  local older="$2"
  if [ "$older" -eq 0 ] || [ "$newer" -eq 0 ]; then
    echo "-1"
    return
  fi
  local diff=$(( (newer - older) / 86400 ))
  if [ "$diff" -lt 0 ]; then
    echo "0"
  else
    echo "$diff"
  fi
}

# Print header
printf "source_file\tdoc_file\tsource_date\tdoc_date\tdays_behind\n"

# Find all source files and try to match them with doc files
# Uses convention-based matching (config mappings are resolved by agents at runtime)

# For convention-based: find source files, look for corresponding docs
find_doc_candidates() {
  local source="$1"
  local basename
  basename=$(basename "$source" | sed 's/\.[^.]*$//')
  local dirname
  dirname=$(dirname "$source" | sed "s|^src/||; s|^lib/||; s|^pkg/||")

  # Try common doc locations
  for doc_dir in "docs" "doc" "documentation"; do
    for sub_dir in "" "api/" "reference/"; do
      local candidate="$doc_dir/${sub_dir}${dirname}/${basename}.md"
      if [ -f "$PROJECT_ROOT/$candidate" ]; then
        echo "$candidate"
        return
      fi
      # Try flattened path
      candidate="$doc_dir/${sub_dir}${basename}.md"
      if [ -f "$PROJECT_ROOT/$candidate" ]; then
        echo "$candidate"
        return
      fi
    done
  done
  echo ""
}

# Source file extensions to check
SOURCE_EXTS="ts tsx js jsx py go rs java kt cs rb swift c cpp h hpp"

for ext in $SOURCE_EXTS; do
  while IFS= read -r -d '' source_file; do
    # Make path relative to project root
    rel_source="${source_file#$PROJECT_ROOT/}"

    # Skip excluded patterns
    case "$rel_source" in
      node_modules/*|vendor/*|dist/*|build/*|.git/*|*/tests/*|*/test/*|*_test.*|*.test.*|*.spec.*|*/__tests__/*|__pycache__/*|target/*)
        continue
        ;;
    esac

    # Find corresponding doc file
    doc_file=$(find_doc_candidates "$rel_source")

    if [ -z "$doc_file" ]; then
      # No doc file found — report as unmapped
      printf "%s\t%s\t%s\t%s\t%s\n" "$rel_source" "(unmapped)" "$(git_last_modified "$rel_source")" "0" "-1"
      continue
    fi

    source_date=$(git_last_modified "$rel_source")
    doc_date=$(git_last_modified "$doc_file")
    days=$(days_between "$source_date" "$doc_date")

    printf "%s\t%s\t%s\t%s\t%s\n" "$rel_source" "$doc_file" "$source_date" "$doc_date" "$days"
  done < <(find "$PROJECT_ROOT" -name "*.$ext" -not -path "*/.git/*" -print0 2>/dev/null)
done
