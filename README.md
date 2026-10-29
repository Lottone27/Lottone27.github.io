# 복권일 포트폴리오

밝은 테마의 단일 메인 페이지와 프로젝트 상세 두 페이지로 구성된 정적 사이트입니다.

## 열기

`index.html`을 브라우저에서 직접 열 수 있습니다. `portfolio.html`은 기존 주소를 위한 동일한 진입 페이지입니다.

HTTP 미리보기가 필요하면 프로젝트 폴더에서 다음을 실행합니다.

```sh
node preview.cjs
```

접속 주소: http://127.0.0.1:4173

## 구성

- `index.html`, `portfolio.html`: 소개, 실무 경험, 프로젝트, 기술·교육, 연락처
- `project-kbo.html`, `project-personal.html`: 프로젝트 상세, 이미지 확대, 시연, 발표자료
- `css/renewal.css`: 공통 디자인 및 메인 레이아웃
- `css/case-study.css`: 상세 페이지 레이아웃
- `js/renewal.js`: 이메일 복사, 읽던 위치 복원, 메뉴 상태
- `js/case-study.js`: 이미지 다이얼로그, 발표자료 이동, GIF 요청 로딩
- `assets/fonts/`: 로컬 Pretendard Variable 폰트와 SIL OFL 라이선스
- `image/`, `notion/`: 기존 프로젝트 자료

기존 `css/styles.css`, `css/portfolio.css`는 보관용이며 새 페이지에서 사용하지 않습니다.

## 확인

```sh
node scripts/verify.cjs
node --check js/renewal.js
node --check js/case-study.js
```

GIF 시연은 선택 시 불러옵니다. 발표자료는 한 장씩 요청합니다. 외부 폰트 CDN이나 JavaScript 라이브러리 없이 작동합니다.
