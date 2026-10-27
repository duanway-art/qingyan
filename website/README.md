# 祖坟冒烟官网

多语言产品介绍页，部署到 `https://qingyan.nonoor.com/`。

App Store 描述请使用：

- 隐私政策：https://qingyan.nonoor.com/privacy
- 用户协议：https://qingyan.nonoor.com/terms

## 结构

```
website/
  index.html
  privacy/index.html
  privacy.html
  terms/index.html
  terms.html
  css/
  js/
  assets/
    app-icon.png
    screenshots/   # zh-Hans / zh-Hant / en / ja / ko
  CNAME
```

## 本地预览

```bash
cd website
python3 -m http.server 8080
```

打开 http://localhost:8080 。可用 `?lang=zh-Hans` 切换语言。

语言优先级：URL `?lang=` → 上次选择 → 浏览器语言 → 英语。

支持：简体中文、繁体中文、English、日本語、한국어。

## 更新法律文档

App 内隐私政策、用户协议、支付条款变更后：

```bash
python3 scripts/generate_legal_web_content.py
```

文本取自 `Zufen/View/LegalDocumentView.swift` 和 `Zufen/Localizable.xcstrings`。用户协议页末尾附《支付条款》。

## 更新截图

```bash
python3 scripts/prepare_website_assets.py
```

会把 `AppStoreMarketing/<语言>/*.png` 缩成官网用的 JPEG，并复制 App 图标。

## 上架后

`APP_STORE_ID` 为空时，下载按钮显示「敬请期待」且不可点击。上架后把 `website/js/main.js` 里的 `APP_STORE_ID` 填成 App Store Connect 中的 Apple ID（纯数字）。

## 部署

将 `website/` 全部上传到 `qingyan.nonoor.com` 站点根目录，保证 `/privacy` 与 `/terms` 能打开。

```bash
rsync -avz --delete website/ user@your-server:/var/www/qingyan.nonoor.com/
```

Nginx 示例：

```
server {
    server_name qingyan.nonoor.com;
    root /var/www/qingyan.nonoor.com;
    index index.html;
    location /privacy { try_files /privacy/index.html /privacy.html =404; }
    location /terms { try_files /terms/index.html /terms.html =404; }
}
```
