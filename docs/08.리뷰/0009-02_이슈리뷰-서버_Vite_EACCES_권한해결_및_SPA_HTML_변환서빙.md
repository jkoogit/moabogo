# [이슈 리뷰 #9-2] 서버 Vite EACCES 권한 해결 및 개발 모드 SPA HTML 변환 서빙 긴급 패치 리뷰

- **문서 ID**: `REV-ISSUE-09-INFRA-SERVER-02` (`080012`)
- **작성 일자**: 2026-10-13
- **관련 파일**: `server.ts`
- **세션 번호**: [0009]
- **태스크 ID**: `TASK-INFRA-09-02`
- **GitHub Issue**: Issue #21 (세션 0009)

---

## 1. 긴급 패치 배경 및 구현 내역

도커 컨테이너 및 샌드박스 환경에서 Express 기반 Vite 개발 서버 구동 시 발생할 수 있는 `node_modules/.vite` 권한(EACCES) 문제와 개발 모드 브라우저 라우팅(SPA 직접 URL 접근 시 404) 문제를 해결하기 위해 긴급 인프라 패치를 적용하였습니다.

### 1.1 핵심 변경 매트릭스

| 영역 | 변경 사항 | 기대 효과 및 해결 결함 |
| :---: | :--- | :--- |
| **Vite Cache 디렉터리** | `cacheDir: '/tmp/.vite'` 명시적 설정 | 컨테이너 권한 제약으로 인한 `node_modules/.vite` 생성 실패(EACCES) 영구 방지 |
| **개발 모드 SPA Fallback** | `app.use('*', ...)` 핸들러 추가 및 `vite.transformIndexHtml(url, template)` 적용 | 새로고침 또는 하위 라우트 직접 접근 시 404 차단 및 HMR/스크립트 태그 자동 주입 서빙 |

---

## 2. 코드 레벨 분석 (`server.ts`)

```typescript
// server.ts
const vite = await createViteServer({
  cacheDir: '/tmp/.vite', // 🔑 [핵심] EACCES 권한 에러 영구 해결
  server: { 
    middlewareMode: true,
    allowedHosts: allowedHosts 
  },
  appType: 'spa',
});
app.use(vite.middlewares);

// 🚀 [404 해결] index.html을 Vite로 변환하여 서빙하는 라우트 핸들러
app.use('*', async (req, res, next) => {
  const url = req.originalUrl;
  try {
    const indexPath = path.resolve('index.html');
    if (fs.existsSync(indexPath)) {
      let template = fs.readFileSync(indexPath, 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    }
    next();
  } catch (e) {
    vite.ssrFixStacktrace(e as Error);
    next(e);
  }
});
```

---

## 3. 정적 검증 및 빌드 결과

1. **`npm run lint` (`tsc --noEmit`)**: 0-Error 통과
2. **`npm run build`**: 1,928개 모듈 번들링 성공
