#!/bin/bash

git remote add aicc-components http://gitlab.yiwise.local/ai-call-platform/front-project/aicc-components.git
git subtree add --prefix=aicc-components aicc-components develop --squash