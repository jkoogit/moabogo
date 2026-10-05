# 03-design-api-spec.md : LETO 스타일 UI/UX & REST API/딥링크 규격서

## 1. 디자인 시스템 (LETO 벤치마킹 - app.leto.kr)

### 1.1 Visual Identity
- **Background**: Modern Dark Slate (`#0F172A`) 또는 Clean Off-White (`#F8FAFC`).
- **Cards**: Bento Grid 둥근 사각형 카드, 1px 미세 테두리 (`border border-slate-200 / border-slate-800`).
- **Status Badges**: Pill Badges (`[1차 OCR: 정상]`, `[연동 가능]`, `[게스트: 매핑필요]`).

### 1.2 Core Components
- **Top Header**: 가계부 조직 스위처 (`[개인 가계부]` <-> `[우리집 가계부]`)
- **Command Palette (`⌘K / Ctrl+K`)**: 1초 만에 지출 검색, 영수증 캡처 업로드, 1/N 정산 실행.

---

## 2. 3대 빅테크 딥링크 URL 스킴 규격

| 서비스 | URL Scheme Format | 비고 |
| :--- | :--- | :--- |
| **카카오페이** | `kakaopay://` | 카카오톡 공유 메시지 카드의 URL 연결 |
| **토스** | `supertoss://send?bank={bank_code}&accountNo={account_no}&amount={amount}` | 받기 계좌 및 금액 자동 채움 |
| **네이버페이** | `naverpay://` | 네이버 앱 송금 화면 연결 |

---

## 3. 핵심 REST API 엔드포인트

```text
POST   /api/v1/auth/social-login          # 카카오/토스/네이버 소셜 로그인
GET    /api/v1/ledgers                    # 사용자의 가계부 목록 조회 (개인/그룹)
POST   /api/v1/ocr/upload                 # 영수증 이미지 업로드 (task_id 즉시 반환)
GET    /api/v1/ocr/tasks/{task_id}        # OCR 파싱 상태 및 결과 조회
POST   /api/v1/events/settle              # 1/N 정산 실행 및 결과 생성
POST   /api/v1/duties                     # 모아당번 등록 (회원/게스트 지정)
POST   /api/v1/duties/{id}/proof          # 당번 수행 사진 등록 (상태: ENDED)
POST   /api/v1/duties/{id}/approve        # 당번 승인 (상태: COMPLETED)
POST   /api/v1/allowance/request          # 모아용돈 요청
POST   /api/v1/loans                      # 모아빌림 대여 등록
```
