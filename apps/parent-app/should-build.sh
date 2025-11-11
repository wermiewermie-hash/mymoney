#!/bin/bash

# Always build on main branch
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]] ; then
  echo "✅ Build required: main branch push"
  exit 1
fi

# Build if parent app changed
if git diff HEAD^ HEAD --quiet apps/parent-app/ ; then
  echo "🚫 No changes in parent app"
else
  echo "✅ Build required: parent app changed"
  exit 1
fi

# Build if shared directory changed (for future use)
if git diff HEAD^ HEAD --quiet shared/ ; then
  echo "🚫 No changes in shared code"
else
  echo "✅ Build required: shared code changed"
  exit 1
fi

echo "🚫 Build not required"
exit 0
