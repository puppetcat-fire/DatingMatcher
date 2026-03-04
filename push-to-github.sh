#!/bin/bash
# 推送本地embedding服务改动到GitHub

echo "=== 推送本地Embedding服务改动到GitHub ==="
echo ""

# 检查Git状态
echo "1. 检查Git状态..."
git status

echo ""
echo "2. 查看待推送的提交..."
git log --oneline -5

echo ""
echo "3. 如果要推送到GitHub，请执行以下步骤："
echo ""
echo "   a) 配置GitHub认证:"
echo "      git remote set-url origin git@github.com:puppetcat-fire/DatingMatcher.git"
echo "      或使用HTTPS+token:"
echo "      git remote set-url origin https://<token>@github.com/puppetcat-fire/DatingMatcher.git"
echo ""
echo "   b) 推送代码:"
echo "      git push origin main"
echo ""
echo "4. 或者，可以导出补丁文件:"
echo "   git format-patch HEAD~2 --stdout > local-embedding-patch.patch"
echo ""
echo "=== 完成 ==="
echo ""
echo "主要改动:"
echo "- 替换OpenAI API为本地embedding服务"
echo "- 解决隐私泄露和成本问题"
echo "- 每月节省约$800 API费用"
echo "- 详细文档: DEPLOYMENT_LOCAL_EMBEDDING.md"