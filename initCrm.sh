#!/bin/bash

git remote add crm http://gitlab.yiwise.local/ai-call-platform/ai-call-platform-web.git
git subtree add --prefix=crm crm feature-aicc --squash