-- =============================================================================
-- 모아보고 (MoaBogo) - PostgreSQL 16 DDL Schema
-- Official Domain: moabogo.com
-- 문서 ID: 040002 (04.데이터/02-erd-schema.sql)
-- 7대 감사 컬럼 표준: created_sys, created_at, created_by, updated_sys, updated_at, updated_by, version
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 사용자 테이블
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    nickname VARCHAR(100) NOT NULL,
    provider VARCHAR(20) NOT NULL, -- KAKAO, TOSS, NAVER, EMAIL
    provider_id VARCHAR(255),
    personal_ocr_key VARCHAR(255), -- 사용자 2차 OCR Key
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1
);

-- 2. 가계부 테이블 (PERSONAL vs GROUP)
CREATE TABLE ledgers (
    ledger_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    ledger_name VARCHAR(100) NOT NULL,
    ledger_type VARCHAR(20) NOT NULL DEFAULT 'PERSONAL', -- PERSONAL, GROUP
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1
);

-- 3. 가계부 멤버 테이블 (RBAC)
CREATE TABLE ledger_members (
    ledger_id UUID REFERENCES ledgers(ledger_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER', -- OWNER, MEMBER, VIEWER
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1,
    PRIMARY KEY (ledger_id, user_id)
);

-- 4. 입출금 지출 내역 테이블
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ledger_id UUID NOT NULL REFERENCES ledgers(ledger_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id),
    transaction_type VARCHAR(20) NOT NULL, -- EXPENSE, INCOME, TRANSFER
    amount DECIMAL(12,2) NOT NULL,
    merchant_name VARCHAR(150),
    category_name VARCHAR(50),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_asset_transfer BOOLEAN DEFAULT FALSE, -- 대여/이동 시 지출통계 제외
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1
);

-- 5. OCR 비동기 작업 테이블
CREATE TABLE ocr_tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    image_hash VARCHAR(64) NOT NULL, -- SHA-256
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED, STALE
    ocr_result JSONB,
    retry_count INT DEFAULT 0,
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1
);

-- 6. 독립 이벤트 (정산/게임) 테이블
CREATE TABLE standalone_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(user_id),
    event_type VARCHAR(50) NOT NULL, -- SETTLEMENT_1_N, LADDER, TAG
    event_title VARCHAR(150) NOT NULL,
    total_amount DECIMAL(12,2) DEFAULT 0,
    binding_option VARCHAR(20) DEFAULT 'ASK_AFTER', -- ASK_AFTER, AUTO_LINK, SKIP
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1
);

-- 7. 독립 이벤트 참가자 테이블 (회원 & 게스트)
CREATE TABLE event_participants (
    participant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES standalone_events(event_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id), -- 정식 회원일 경우 매핑
    guest_name VARCHAR(100),                -- 미매핑 게스트 닉네임
    amount_due DECIMAL(12,2) DEFAULT 0,
    is_settled BOOLEAN DEFAULT FALSE,
    is_mapped BOOLEAN DEFAULT FALSE,
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1
);

-- 8. 모아당번 테이블 (회원 & 게스트 지원)
CREATE TABLE moa_duties (
    duty_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ledger_id UUID NOT NULL REFERENCES ledgers(ledger_id) ON DELETE CASCADE,
    duty_title VARCHAR(150) NOT NULL,
    assigned_user_id UUID REFERENCES users(user_id),
    assigned_guest_name VARCHAR(100),
    approval_required BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ASSIGNED', -- ASSIGNED, ENDED, COMPLETED
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1
);

-- 9. 모아당번 수행 로그
CREATE TABLE moa_duty_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    duty_id UUID NOT NULL REFERENCES moa_duties(duty_id) ON DELETE CASCADE,
    proof_image_url VARCHAR(500),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES users(user_id),
    approved_at TIMESTAMP WITH TIME ZONE,
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1
);

-- 10. 모아용돈 요청 테이블
CREATE TABLE moa_allowances (
    allowance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(user_id),
    approver_id UUID REFERENCES users(user_id),
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'REQUESTED', -- REQUESTED, APPROVED, PAID, REJECTED
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1
);

-- 11. 모아빌림 (대여/차용) 테이블
CREATE TABLE moa_loans (
    loan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lender_id UUID NOT NULL REFERENCES users(user_id),
    borrower_id UUID NOT NULL REFERENCES users(user_id),
    amount DECIMAL(12,2) NOT NULL,
    remaining_amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, PARTIAL_PAID, FULLY_PAID, OVERDUE
    -- 7대 필수 감사 컬럼 (Audit Columns)
    created_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_sys VARCHAR(50) NOT NULL DEFAULT 'WEB_APP',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    version INT NOT NULL DEFAULT 1
);

-- =============================================================================
-- 인덱스 (조회 성능 최적화)
-- =============================================================================
CREATE INDEX idx_transactions_ledger_date ON transactions(ledger_id, transaction_date DESC);
CREATE INDEX idx_ledger_members_user ON ledger_members(user_id);
CREATE INDEX idx_ocr_tasks_user_status ON ocr_tasks(user_id, status);
CREATE INDEX idx_moa_duties_ledger_status ON moa_duties(ledger_id, status);
CREATE INDEX idx_moa_allowances_requester ON moa_allowances(requester_id, status);
CREATE INDEX idx_moa_loans_user_status ON moa_loans(lender_id, borrower_id, status);

-- =============================================================================
-- 작업 이력 (History)
-- | 작업일자 | 이슈ID | 태스크 | 작업자 | 작업내용 | 사용 AI 모델명 | 에이전트 | 참고링크 |
-- | :---: | :---: | :---: | :---: | :--- | :---: | :---: | :---: |
-- | 2026-10-07 | 0001 | DOCS-INIT | jkoogit | 초기 DDL 스키마 11개 테이블 작성 | - | - | docs/04.데이터/ |
-- | 2026-10-07 | 0002 | TASK-AUDIT | AI Studio Agent | 11개 전 테이블 대상 7대 필수 감사 컬럼 및 성능 인덱스 반영 | models/gemini-3.8-flash | AI Studio | docs/README-docs.md |
-- =============================================================================
