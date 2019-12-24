# aicc-customer-center

> My luminous Nuxt.js project

# 加入crm

git remote add crm http://gitlab.yiwise.local/ai-call-platform/ai-call-platform-web.git
git subtree add --prefix=crm crm feature-aicc --squash

# 同步crm最新代码

git subtree pull --prefix=crm crm feature-aicc --squash

# 修改crm并commit后，推送到crm分支

git subtree push --prefix=crm crm feature-aicc --squash

# 加入aicc-components

git remote add aicc-components http://gitlab.yiwise.local/ai-call-platform/front-project/aicc-components.git
git subtree add --prefix=aicc-components aicc-components develop --squash

同步及推送代码命令参照crm

