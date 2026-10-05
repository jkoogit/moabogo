# 모아보고 (MoaBogo) 프로젝트 문서 

---

## 프로젝트 문서에 정리할 초안내용


1. **카테고리검토**: 작성내용을 바탕으로 적절한 카테고리 선정
2. **작성내용분석**: 작성영역의 초안을 분석하여 정리할 내용 검토
3. **작성내용 다듬기**: 참고내용 문구 대상 문서의 위치로 링크설정
4. **최종검토**: 대상문서 수정시 수정이력 작성


---

### [작성내용]
---

#### 대상 : 전체문서
1. 문서이력 보완

#### 대상 : docs\04.데이터\01-erd-schema.sql
1. 테이블 메타정보 속성추가 : 등록자, 등록일시, 등록시스템, 수정자, 수정일시, 수정시스템, 버전

#### 검토 : 
1. 아키텍처 검토 : ocr 성능을 고려한 전환 검토
1.1 고정 : db[우분투서버도커설치서비스], ocr[우분투서버도커설치서비스]
   - db : 외부에 포트노출을 우려한 cloudflare_tunnel 구성
1.2 기존 : (문서방향)
   - 클라우드서비스 : cloudtype, aws, gcp, 네이버, 디지털오션 (저비용서비스)
   - 내부네트워크서비스 : qnap nas
1.2 신규 : 
   - 단일인프라 : 우분투서버도커설치서비스 - 배포인프라구성필요
1.3 결정 : 단일인프라방향으로 의사결정을 하고 관련문서 내용 다음버전으로 현행화


#### 검토 : 아키텍처
1. 백엔드 : Spring Boot (Kotlin + Spring Data JPA)
2. 프론트 : React + Vite (PWA) + Tailwind CSS + Zustand
   * **디자인 시스템**: LETO 톤앤매너 (Bento Grid Layout, `⌘K` 커맨드 팔레트, 1px Subtle Border).
   * **상태 관리 &amp; API Layer**:
      * **UI Local/Global State**: `Zustand` (가벼우며 객체지향적 스토어 분리 용이).
      * **Server State**: `TanStack Query (React Query)` (캐싱, 낙관적 업데이트, 오프라인 재연결 수신).
   * **프론트엔드 레이어링 (FSD / DDD-Lite)**:
      * `entities/`: 가계부, 지출, 정산 등 도메인 모델 및 Pure Function.
      * `features/`: OCR 영수증 스캔, 당번 수동 승인 등 유즈케이스 단위 컴포넌트.
      * `widgets/`: Bento Grid 위젯, ⌘K 모달 등 종합 UI 컴포넌트.
3. 데이터베이스, 영속성: PostgreSQL 16 + TypeORM
      * **PostgreSQL 16**: JSONB 지원으로 정산 게임 세부 결과 및 OCR 상대좌표(`box_normalized`) 데이터를 유연하게 저장.
      * **Domain Entity vs Persistence Entity 분리**:
         * DB 테이블과 매핑되는 ORM 클래스(`TransactionOrmEntity`)와 순수 비즈니스 도메인 객체(`TransactionDomain`)를 매퍼(Mapper) 함수로 분리하여 **DB 스키마가 변경되어도 비즈니스 로직에 영향을 주지 않도록 설계**합니다.
4. 핵심 로직 격리를 위한 백엔드 디렉토리 구조 예시
   AI(바이브 코딩) 프롬프트 제공 시 지정하기 가장 좋은 표준 폴더 구조
   ```
   src/
   ├── domain/                      # 🧠 [100% 순수 도메인 - 외부 의존성 0%]
   │   ├── ledger/
   │   │   ├── model/               # Ledger, Transaction, Money (Value Object)
   │   │   ├── service/             # InternalTransferPolicy (이중계상 방지 서비스)
   │   │   └── repository/          # LedgerRepository.interface.ts (Port)
   │   ├── ocr/
   │   │   ├── model/               # ParsedReceipt, NormalizedBox
   │   │   └── port/                # OcrEngine.interface.ts (Port)
   │   └── duty/
   │       └── model/               # MoaDuty, DutyStatus (ASSIGNED -> ENDED -> COMPLETED)
   │
   ├── application/                 # ⚙️ [유즈케이스 & 서비스 레이어]
   │   ├── use-case/
   │   │   ├── ProcessReceiptOcrUseCase.ts
   │   │   └── SettleGroupExpenseUseCase.ts
   │   └── dto/                     # Request / Response DTOs
   │
   ├── infrastructure/              # 🔌 [외부 어댑터 구현체]
   │   ├── persistence/
   │   │   ├── postgres/            # TypeORM Entities & Repositories
   │   │   └── mapper/              # OrmToDomainMapper.ts
   │   ├── ocr/
   │   │   ├── EasyOcrHttpAdapter.ts # 로컬 Docker FastAPI 호출
   │   │   └── UserApiKeyOcrAdapter.ts # 2차 개인 OpenAI/Vision Key 호출
   │   └── external/
   │       └── PaymentDeepLinkAdapter.ts # 토스/카카오페이 딥링크 생성기
   │
   └── presentation/                # 🌐 [API 엔드포인트]
      └── http/
         ├── LedgerController.ts
         └── OcrController.ts
   ```         