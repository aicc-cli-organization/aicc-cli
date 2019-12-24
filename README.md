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


# 如果不需要crm，请手动将package.json中的yiwise-components删了，或者其他包觉得不要的也可以删了。。。。
