-- =============================================================================
-- 모아보고 (MoaBogo) - PostgreSQL 16 DDL Schema
-- Official Domain: moabogo.com
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 가계부 테이블 (PERSONAL vs GROUP)
CREATE TABLE ledgers (
    ledger_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    ledger_name VARCHAR(100) NOT NULL,
    ledger_type VARCHAR(20) NOT NULL DEFAULT 'PERSONAL', -- PERSONAL, GROUP
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 가계부 멤버 테이블 (RBAC)
CREATE TABLE ledger_members (
    ledger_id UUID REFERENCES ledgers(ledger_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER', -- OWNER, MEMBER, VIEWER
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. OCR 비동기 작업 테이블
CREATE TABLE ocr_tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    image_hash VARCHAR(64) NOT NULL, -- SHA-256
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED, STALE
    ocr_result JSONB,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. 독립 이벤트 (정산/게임) 테이블
CREATE TABLE standalone_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(user_id),
    event_type VARCHAR(50) NOT NULL, -- SETTLEMENT_1_N, LADDER, TAG
    event_title VARCHAR(150) NOT NULL,
    total_amount DECIMAL(12,2) DEFAULT 0,
    binding_option VARCHAR(20) DEFAULT 'ASK_AFTER', -- ASK_AFTER, AUTO_LINK, SKIP
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 독립 이벤트 참가자 테이블 (회원 & 게스트)
CREATE TABLE event_participants (
    participant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES standalone_events(event_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id), -- 정식 회원일 경우 매핑
    guest_name VARCHAR(100),                -- 미매핑 게스트 닉네임
    amount_due DECIMAL(12,2) DEFAULT 0,
    is_settled BOOLEAN DEFAULT FALSE,
    is_mapped BOOLEAN DEFAULT FALSE
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. 모아당번 수행 로그
CREATE TABLE moa_duty_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    duty_id UUID NOT NULL REFERENCES moa_duties(duty_id) ON DELETE CASCADE,
    proof_image_url VARCHAR(500),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES users(user_id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 10. 모아용돈 요청 테이블
CREATE TABLE moa_allowances (
    allowance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(user_id),
    approver_id UUID REFERENCES users(user_id),
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'REQUESTED', -- REQUESTED, APPROVED, PAID, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
