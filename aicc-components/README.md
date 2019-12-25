## aicc-components

- 暂时作为各系统的基础库，待稳定后，全部push到aicc-components，发布一个npm版本

- 开发阶段用项目用subtree管理该基础库

### 主项目(p1)提交代码的方式和之前没有差别，即使涉及aicc-components(b1)的更改，也没有关系

### 注意： 如果另一个主项目(p2)需要拉取最新的aicc-components, 则需要进行subtree管理

### subtree管理
- p1添加subtree remote
  - git remote add -f aicc-components http://gitlab.yiwise.local/ai-call-platform/front-project/aicc-components.git

- p1添加subtree
  - git subtree add --prefix=aicc-components aicc-components master --squash

- pull到本地
  - git subtree pull --prefix=aicc-components aicc-components master --squash

- push到远程
  - cd aicc-components
  - git add . && git commit -m "feat: 添加XXX功能"
  - cd p1
  - git subtree push --prefix=aicc-components aicc-components master

- 高阶1
  - push到远程发现遍历的commit过多时候，需要借助subtree split功能
  - git subtree split --rejoin --prefix=aicc-components --branch xxx
  - git push aicc-components xxx:master
  - 下次push就会从xxx开始遍历