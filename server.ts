import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';

interface User {
  user_id: string;
  email: string;
  nickname: string;
  provider: 'KAKAO' | 'TOSS' | 'NAVER' | 'EMAIL';
  provider_id: string;
  personal_ocr_key?: string;
  created_at: string;
}

interface Ledger {
  ledger_id: string;
  owner_id: string;
  ledger_name: string;
  ledger_type: 'PERSONAL' | 'GROUP';
  is_instance?: boolean;
  role?: 'OWNER' | 'MEMBER' | 'VIEWER';
  created_at: string;
}

interface Transaction {
  transaction_id: string;
  ledger_id: string;
  user_id: string;
  transaction_type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  merchant_name: string;
  category_name: string;
  transaction_date: string;
  is_asset_transfer: boolean; // true for loans/transfers to prevent distorting living expense budget
  created_at: string;
  note?: string;
}

interface OCRTask {
  task_id: string;
  user_id: string;
  image_hash: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'STALE';
  ocr_result?: {
    merchant_name: string;
    amount: number;
    transaction_date: string;
    items?: Array<{ name: string; price: number; qty: number }>;
    is_validated: boolean;
    flagged_fields: string[]; // e.g., ['amount', 'merchant_name']
    engine_used: 'EASY_OCR_LOCAL' | 'USER_KEY_OCR';
  };
  retry_count: number;
  created_at: string;
  updated_at: string;
}

interface StandaloneEvent {
  event_id: string;
  created_by: string;
  event_type: 'SETTLEMENT_1_N' | 'LADDER' | 'TAG';
  event_title: string;
  total_amount: number;
  binding_option: 'ASK_AFTER' | 'AUTO_LINK' | 'SKIP';
  has_guests: boolean;
  created_at: string;
  participants: Array<{
    participant_id: string;
    user_id?: string;
    name: string;
    is_guest: boolean;
    amount_due: number;
    is_settled: boolean;
    is_mapped: boolean;
  }>;
}

interface MoaDuty {
  duty_id: string;
  ledger_id: string;
  duty_title: string;
  assigned_user_id?: string;
  assigned_name: string;
  is_guest: boolean;
  approval_required: boolean;
  status: 'ASSIGNED' | 'ENDED' | 'COMPLETED';
  proof_image_url?: string;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

interface MoaAllowance {
  allowance_id: string;
  requester_id: string;
  requester_name: string;
  approver_id?: string;
  approver_name?: string;
  amount: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'PAID' | 'REJECTED';
  created_at: string;
  paid_at?: string;
  payment_method?: 'KAKAO_PAY' | 'TOSS' | 'NAVER_PAY';
}

interface MoaLoan {
  loan_id: string;
  lender_id: string;
  lender_name: string;
  borrower_id: string;
  borrower_name: string;
  amount: number;
  remaining_amount: number;
  due_date: string;
  status: 'ACTIVE' | 'PARTIAL_PAID' | 'FULLY_PAID' | 'OVERDUE';
  created_at: string;
  repayments: Array<{ date: string; amount: number; note: string }>;
}

// In-Memory Database (Seeded with PRD compliant mock state)
const DEFAULT_USER: User = {
  user_id: 'u-1001-koo',
  email: 'jkok2j2m@gmail.com',
  nickname: '구본영(호스트)',
  provider: 'KAKAO',
  provider_id: 'kakao_987654321',
  personal_ocr_key: '',
  created_at: new Date('2026-01-01').toISOString(),
};

const USERS: User[] = [
  DEFAULT_USER,
  {
    user_id: 'u-1002-kim',
    email: 'kim_family@moabogo.com',
    nickname: '김은지(배우자)',
    provider: 'NAVER',
    provider_id: 'naver_12345',
    created_at: new Date('2026-01-02').toISOString(),
  },
  {
    user_id: 'u-1003-child',
    email: 'child_minwoo@moabogo.com',
    nickname: '구민우(자녀)',
    provider: 'TOSS',
    provider_id: 'toss_67890',
    created_at: new Date('2026-01-05').toISOString(),
  },
  {
    user_id: 'u-1004-friend',
    email: 'friend_park@moabogo.com',
    nickname: '박준혁(동창)',
    provider: 'KAKAO',
    provider_id: 'kakao_55555',
    created_at: new Date('2026-02-01').toISOString(),
  },
];

let LEDGERS: Ledger[] = [
  {
    ledger_id: 'led-personal-01',
    owner_id: DEFAULT_USER.user_id,
    ledger_name: '내 개인 가계부 (기본)',
    ledger_type: 'PERSONAL',
    role: 'OWNER',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    ledger_id: 'led-group-01',
    owner_id: DEFAULT_USER.user_id,
    ledger_name: '우리집 가계부 (가족 공유)',
    ledger_type: 'GROUP',
    role: 'OWNER',
    created_at: new Date('2026-01-03').toISOString(),
  },
  {
    ledger_id: 'led-instance-01',
    owner_id: DEFAULT_USER.user_id,
    ledger_name: '2026 상반기 동창 모임 (인스턴스)',
    ledger_type: 'GROUP',
    is_instance: true,
    role: 'OWNER',
    created_at: new Date('2026-03-01').toISOString(),
  },
];

let TRANSACTIONS: Transaction[] = [
  {
    transaction_id: 'tx-001',
    ledger_id: 'led-personal-01',
    user_id: DEFAULT_USER.user_id,
    transaction_type: 'EXPENSE',
    amount: 14500,
    merchant_name: '스타벅스 강남점',
    category_name: '식음료/카페',
    transaction_date: '2026-10-05T08:30:00Z',
    is_asset_transfer: false,
    created_at: '2026-10-05T08:31:00Z',
    note: '모닝 라떼 & 베이글',
  },
  {
    transaction_id: 'tx-002',
    ledger_id: 'led-personal-01',
    user_id: DEFAULT_USER.user_id,
    transaction_type: 'EXPENSE',
    amount: 68000,
    merchant_name: '교보문고 광화문점',
    category_name: '도서/자기계발',
    transaction_date: '2026-10-04T14:10:00Z',
    is_asset_transfer: false,
    created_at: '2026-10-04T14:15:00Z',
    note: '클라우드 아키텍처 및 경제 서적',
  },
  {
    transaction_id: 'tx-003',
    ledger_id: 'led-personal-01',
    user_id: DEFAULT_USER.user_id,
    transaction_type: 'INCOME',
    amount: 4500000,
    merchant_name: '주식회사 테크코리아',
    category_name: '급여/상여',
    transaction_date: '2026-10-01T09:00:00Z',
    is_asset_transfer: false,
    created_at: '2026-10-01T09:01:00Z',
    note: '10월 정기 급여',
  },
  {
    transaction_id: 'tx-004',
    ledger_id: 'led-group-01',
    user_id: DEFAULT_USER.user_id,
    transaction_type: 'EXPENSE',
    amount: 124800,
    merchant_name: '이마트 양재점',
    category_name: '식료품/마트',
    transaction_date: '2026-10-03T18:20:00Z',
    is_asset_transfer: false,
    created_at: '2026-10-03T18:22:00Z',
    note: '주말 가족 식자재 장보기',
  },
  {
    transaction_id: 'tx-005',
    ledger_id: 'led-group-01',
    user_id: 'u-1002-kim',
    transaction_type: 'EXPENSE',
    amount: 52000,
    merchant_name: '올리브영 양재하나로점',
    category_name: '생활/잡화',
    transaction_date: '2026-10-04T16:00:00Z',
    is_asset_transfer: false,
    created_at: '2026-10-04T16:02:00Z',
    note: '가족 세면용품 구비',
  },
  {
    transaction_id: 'tx-006',
    ledger_id: 'led-group-01',
    user_id: DEFAULT_USER.user_id,
    transaction_type: 'TRANSFER',
    amount: 50000,
    merchant_name: '구민우(자녀 용돈 지급)',
    category_name: '가족 내부 이동',
    transaction_date: '2026-10-02T11:00:00Z',
    is_asset_transfer: true, // Double counting guardrail: asset transfer
    created_at: '2026-10-02T11:05:00Z',
    note: '모아용돈 지급 (그룹 가계부 이중 합산 방지)',
  },
  {
    transaction_id: 'tx-007',
    ledger_id: 'led-instance-01',
    user_id: DEFAULT_USER.user_id,
    transaction_type: 'EXPENSE',
    amount: 180000,
    merchant_name: '맛있는 제주 흑돼지',
    category_name: '회식/모임',
    transaction_date: '2026-10-02T19:30:00Z',
    is_asset_transfer: false,
    created_at: '2026-10-02T19:35:00Z',
    note: '동창회 1차 회식',
  },
];

let OCR_TASKS: OCRTask[] = [];

let STANDALONE_EVENTS: StandaloneEvent[] = [
  {
    event_id: 'evt-001',
    created_by: DEFAULT_USER.user_id,
    event_type: 'SETTLEMENT_1_N',
    event_title: '주말 글램핑 바베큐 정산',
    total_amount: 156000,
    binding_option: 'ASK_AFTER',
    has_guests: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    participants: [
      {
        participant_id: 'p-1',
        user_id: DEFAULT_USER.user_id,
        name: '구본영(호스트)',
        is_guest: false,
        amount_due: 39000,
        is_settled: true,
        is_mapped: true,
      },
      {
        participant_id: 'p-2',
        user_id: 'u-1004-friend',
        name: '박준혁(동창)',
        is_guest: false,
        amount_due: 39000,
        is_settled: false,
        is_mapped: true,
      },
      {
        participant_id: 'p-3',
        name: '게스트 정현우(미가입)',
        is_guest: true,
        amount_due: 39000,
        is_settled: false,
        is_mapped: false,
      },
      {
        participant_id: 'p-4',
        name: '게스트 최영식(미가입)',
        is_guest: true,
        amount_due: 39000,
        is_settled: false,
        is_mapped: false,
      },
    ],
  },
];

let MOA_DUTIES: MoaDuty[] = [
  {
    duty_id: 'duty-001',
    ledger_id: 'led-group-01',
    duty_title: '주말 분리수거 및 음식물 쓰레기 배출',
    assigned_user_id: DEFAULT_USER.user_id,
    assigned_name: '구본영(호스트)',
    is_guest: false,
    approval_required: true,
    status: 'COMPLETED',
    proof_image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=60',
    submitted_at: '2026-10-04T19:00:00Z',
    approved_by: 'u-1002-kim',
    approved_at: '2026-10-04T19:30:00Z',
    created_at: '2026-10-03T10:00:00Z',
  },
  {
    duty_id: 'duty-002',
    ledger_id: 'led-group-01',
    duty_title: '거실 청소기 및 물걸레 밀기',
    assigned_user_id: 'u-1003-child',
    assigned_name: '구민우(자녀)',
    is_guest: false,
    approval_required: true,
    status: 'ENDED',
    proof_image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=60',
    submitted_at: '2026-10-05T10:20:00Z',
    created_at: '2026-10-05T08:00:00Z',
  },
  {
    duty_id: 'duty-003',
    ledger_id: 'led-instance-01',
    duty_title: '동창회 펜션 식기 설거지 & 정리',
    assigned_name: '게스트 정현우',
    is_guest: true,
    approval_required: false, // ENDED 인정 옵션
    status: 'ASSIGNED',
    created_at: '2026-10-05T09:00:00Z',
  },
];

let MOA_ALLOWANCES: MoaAllowance[] = [
  {
    allowance_id: 'alw-001',
    requester_id: 'u-1003-child',
    requester_name: '구민우(자녀)',
    approver_id: DEFAULT_USER.user_id,
    approver_name: '구본영(호스트)',
    amount: 30000,
    reason: '중간고사 대비 수학 문제집 구매 및 독서실 3일권',
    status: 'APPROVED',
    created_at: '2026-10-04T15:30:00Z',
  },
  {
    allowance_id: 'alw-002',
    requester_id: 'u-1003-child',
    requester_name: '구민우(자녀)',
    approver_id: DEFAULT_USER.user_id,
    approver_name: '구본영(호스트)',
    amount: 50000,
    reason: '친구 생일선물 구입 및 분식집 정산',
    status: 'PAID',
    payment_method: 'TOSS',
    created_at: '2026-10-01T12:00:00Z',
    paid_at: '2026-10-01T12:05:00Z',
  },
];

let MOA_LOANS: MoaLoan[] = [
  {
    loan_id: 'loan-001',
    lender_id: DEFAULT_USER.user_id,
    lender_name: '구본영(호스트)',
    borrower_id: 'u-1004-friend',
    borrower_name: '박준혁(동창)',
    amount: 300000,
    remaining_amount: 150000,
    due_date: '2026-11-15',
    status: 'PARTIAL_PAID',
    created_at: '2026-09-10T14:00:00Z',
    repayments: [
      { date: '2026-09-30', amount: 150000, note: '1차 분할 상환 이체 완료' },
    ],
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Logging & CORS middleware
  app.use((req, res, next) => {
    res.setHeader('X-Application-Name', 'MoaBogo');
    next();
  });

  // -------------------------------------------------------------
  // REST API Endpoints
  // -------------------------------------------------------------

  // 1. Social Login
  app.post('/api/v1/auth/social-login', (req, res) => {
    const { provider = 'KAKAO', nickname, email } = req.body;
    let user = USERS.find((u) => u.provider === provider && (!email || u.email === email));
    if (!user) {
      user = {
        user_id: `u-${Date.now()}`,
        email: email || `${provider.toLowerCase()}_user@moabogo.com`,
        nickname: nickname || `${provider} 사용자`,
        provider,
        provider_id: `${provider.toLowerCase()}_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      USERS.push(user);
    }
    res.json({
      success: true,
      user,
      token: `jwt-mock-${user.user_id}`,
      message: '로그인 성공',
    });
  });

  // Current User & OCR key settings
  app.get('/api/v1/user/me', (req, res) => {
    res.json(DEFAULT_USER);
  });

  app.post('/api/v1/user/ocr-key', (req, res) => {
    const { personal_ocr_key } = req.body;
    DEFAULT_USER.personal_ocr_key = personal_ocr_key || '';
    res.json({ success: true, personal_ocr_key: DEFAULT_USER.personal_ocr_key });
  });

  // 2. Ledgers
  app.get('/api/v1/ledgers', (req, res) => {
    res.json(LEDGERS);
  });

  app.post('/api/v1/ledgers', (req, res) => {
    const { ledger_name, ledger_type = 'GROUP', is_instance = false } = req.body;
    if (!ledger_name) {
      return res.status(400).json({ error: '가계부 이름을 입력해주세요.' });
    }
    const newLedger: Ledger = {
      ledger_id: `led-${Date.now()}`,
      owner_id: DEFAULT_USER.user_id,
      ledger_name,
      ledger_type,
      is_instance,
      role: 'OWNER',
      created_at: new Date().toISOString(),
    };
    LEDGERS.push(newLedger);
    res.status(201).json(newLedger);
  });

  // 3. Transactions
  app.get('/api/v1/ledgers/:ledgerId/transactions', (req, res) => {
    const { ledgerId } = req.params;
    const txs = TRANSACTIONS.filter((t) => t.ledger_id === ledgerId).sort(
      (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );
    res.json(txs);
  });

  app.post('/api/v1/ledgers/:ledgerId/transactions', (req, res) => {
    const { ledgerId } = req.params;
    const {
      transaction_type = 'EXPENSE',
      amount,
      merchant_name,
      category_name = '기타',
      transaction_date = new Date().toISOString(),
      is_asset_transfer = false,
      note = '',
      force = false,
    } = req.body;

    if (!amount || !merchant_name) {
      return res.status(400).json({ error: '금액과 가맹점명을 정확히 입력해주세요.' });
    }

    // Duplicate check: [날짜 + 금액 + 가맹점]
    const dateStr = new Date(transaction_date).toISOString().slice(0, 10);
    const duplicate = TRANSACTIONS.find(
      (t) =>
        t.ledger_id === ledgerId &&
        t.amount === Number(amount) &&
        t.merchant_name.trim().toLowerCase() === merchant_name.trim().toLowerCase() &&
        t.transaction_date.slice(0, 10) === dateStr
    );

    if (duplicate && !force) {
      return res.status(409).json({
        warning: 'DUPLICATE_SUSPECTED',
        message: '동일 날짜, 동일 금액, 동일 가맹점의 내역이 이미 존재합니다.',
        duplicate_id: duplicate.transaction_id,
      });
    }

    const newTx: Transaction = {
      transaction_id: `tx-${Date.now()}`,
      ledger_id: ledgerId,
      user_id: DEFAULT_USER.user_id,
      transaction_type,
      amount: Number(amount),
      merchant_name,
      category_name,
      transaction_date,
      is_asset_transfer: Boolean(is_asset_transfer),
      created_at: new Date().toISOString(),
      note,
    };

    TRANSACTIONS.unshift(newTx);
    res.status(201).json(newTx);
  });

  // Delete transaction (support testing offline stale conflict)
  app.delete('/api/v1/transactions/:id', (req, res) => {
    const { id } = req.params;
    const idx = TRANSACTIONS.findIndex((t) => t.transaction_id === id);
    if (idx !== -1) {
      TRANSACTIONS.splice(idx, 1);
      return res.json({ success: true, deleted_id: id });
    }
    res.status(404).json({ error: '내역을 찾을 수 없습니다.' });
  });

  // 4. OCR 2-Stage Engine & Tasks
  app.post('/api/v1/ocr/upload', (req, res) => {
    const { image_base64, image_name = 'receipt.jpg', user_ocr_key } = req.body;

    const hash = crypto
      .createHash('sha256')
      .update(image_base64 || image_name + Date.now())
      .digest('hex');

    // Idempotency: If exact same hash processed, return existing
    const existing = OCR_TASKS.find((t) => t.image_hash === hash);
    if (existing) {
      return res.json({
        task_id: existing.task_id,
        status: existing.status,
        message: '이미 등록된 영수증 해시입니다. 기존 작업 결과를 반환합니다.',
      });
    }

    const taskId = `ocr-${Date.now()}`;

    // Sample recognition simulation (with realistic 1st OCR or 2nd OCR flow)
    const usesUserKey = Boolean(user_ocr_key || DEFAULT_USER.personal_ocr_key);

    const task: OCRTask = {
      task_id: taskId,
      user_id: DEFAULT_USER.user_id,
      image_hash: hash,
      status: 'PROCESSING',
      retry_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    OCR_TASKS.unshift(task);

    // Asynchronous parse simulation
    setTimeout(() => {
      // Simulate validation results:
      // If image_name includes 'error' or 'unclear', produce flagged fields for manual correction modal
      const isProblematic = image_name.toLowerCase().includes('blur') || image_name.toLowerCase().includes('fail');

      task.status = 'COMPLETED';
      task.updated_at = new Date().toISOString();
      task.ocr_result = {
        merchant_name: isProblematic ? '??마트 (인식불명)' : 'GS25 역삼디오빌점',
        amount: isProblematic ? 0 : 18500,
        transaction_date: isProblematic ? '' : '2026-10-05T12:30:00Z',
        items: [
          { name: '생수 2L 6입', price: 3600, qty: 1 },
          { name: '도시락 든든한 한끼', price: 5400, qty: 1 },
          { name: '아메리카노 헤이즐넛', price: 2500, qty: 2 },
          { name: '크림 롤케이크', price: 4500, qty: 1 },
        ],
        is_validated: !isProblematic,
        flagged_fields: isProblematic ? ['merchant_name', 'amount', 'transaction_date'] : [],
        engine_used: usesUserKey ? 'USER_KEY_OCR' : 'EASY_OCR_LOCAL',
      };
    }, 600);

    res.status(202).json({
      task_id: taskId,
      status: 'PROCESSING',
      message: '영수증이 접수되었습니다. (Ubuntu EasyOCR 세마포어 대기열 등록)',
    });
  });

  app.get('/api/v1/ocr/tasks/:taskId', (req, res) => {
    const { taskId } = req.params;
    const task = OCR_TASKS.find((t) => t.task_id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'OCR 작업을 찾을 수 없습니다.' });
    }
    res.json(task);
  });

  // 5. Standalone Events & Games (1/N Settlement, Ladder, Tag)
  app.get('/api/v1/events', (req, res) => {
    res.json(STANDALONE_EVENTS);
  });

  app.post('/api/v1/events/settle', (req, res) => {
    const {
      event_type = 'SETTLEMENT_1_N',
      event_title,
      total_amount,
      participants,
      binding_option = 'ASK_AFTER',
    } = req.body;

    if (!event_title || !total_amount || !participants || participants.length === 0) {
      return res.status(400).json({ error: '정산 제목, 총액 및 참가자 명단을 입력해주세요.' });
    }

    const hasGuests = participants.some((p: any) => p.is_guest);
    const splitAmount = Math.round(Number(total_amount) / participants.length);

    const formattedParticipants = participants.map((p: any, idx: number) => ({
      participant_id: `p-${Date.now()}-${idx}`,
      user_id: p.user_id,
      name: p.name,
      is_guest: Boolean(p.is_guest),
      amount_due: splitAmount,
      is_settled: p.user_id === DEFAULT_USER.user_id,
      is_mapped: !p.is_guest,
    }));

    const newEvent: StandaloneEvent = {
      event_id: `evt-${Date.now()}`,
      created_by: DEFAULT_USER.user_id,
      event_type,
      event_title,
      total_amount: Number(total_amount),
      binding_option,
      has_guests: hasGuests,
      created_at: new Date().toISOString(),
      participants: formattedParticipants,
    };

    STANDALONE_EVENTS.unshift(newEvent);

    // If binding_option is AUTO_LINK and no guests, link to active ledger
    if (binding_option === 'AUTO_LINK' && !hasGuests) {
      const activeLedger = LEDGERS[0];
      TRANSACTIONS.unshift({
        transaction_id: `tx-evt-${Date.now()}`,
        ledger_id: activeLedger.ledger_id,
        user_id: DEFAULT_USER.user_id,
        transaction_type: 'EXPENSE',
        amount: Number(total_amount),
        merchant_name: event_title,
        category_name: '모임/정산',
        transaction_date: new Date().toISOString(),
        is_asset_transfer: false,
        created_at: new Date().toISOString(),
        note: `[자동 연동] ${event_title} (${participants.length}인 분할)`,
      });
    }

    res.status(201).json(newEvent);
  });

  // Participant settlement toggle
  app.post('/api/v1/events/:eventId/participants/:participantId/settle', (req, res) => {
    const { eventId, participantId } = req.params;
    const evt = STANDALONE_EVENTS.find((e) => e.event_id === eventId);
    if (!evt) return res.status(404).json({ error: '이벤트를 찾을 수 없습니다.' });

    const p = evt.participants.find((item) => item.participant_id === participantId);
    if (!p) return res.status(404).json({ error: '참가자를 찾을 수 없습니다.' });

    p.is_settled = !p.is_settled;
    res.json({ success: true, participant: p });
  });

  // Manual link verified member to ledger
  app.post('/api/v1/events/:eventId/link-to-ledger', (req, res) => {
    const { eventId } = req.params;
    const { ledger_id, participant_ids } = req.body;

    const evt = STANDALONE_EVENTS.find((e) => e.event_id === eventId);
    if (!evt) return res.status(404).json({ error: '이벤트를 찾을 수 없습니다.' });

    const selectedLedger = LEDGERS.find((l) => l.ledger_id === ledger_id) || LEDGERS[0];

    // Only allow verified members (not unmapped guests)
    const validParticipants = evt.participants.filter(
      (p) => !p.is_guest && (!participant_ids || participant_ids.includes(p.participant_id))
    );

    const sumAmount = validParticipants.reduce((acc, cur) => acc + cur.amount_due, 0);

    const newTx: Transaction = {
      transaction_id: `tx-link-${Date.now()}`,
      ledger_id: selectedLedger.ledger_id,
      user_id: DEFAULT_USER.user_id,
      transaction_type: 'EXPENSE',
      amount: sumAmount || evt.total_amount,
      merchant_name: evt.event_title,
      category_name: '모임/정산',
      transaction_date: new Date().toISOString(),
      is_asset_transfer: false,
      created_at: new Date().toISOString(),
      note: `[수동 연동] 정식 회원 ${validParticipants.length}명 분할`,
    };

    TRANSACTIONS.unshift(newTx);
    res.json({ success: true, transaction: newTx, linked_count: validParticipants.length });
  });

  // 6. MoaDuty (모아당번)
  app.get('/api/v1/duties', (req, res) => {
    res.json(MOA_DUTIES);
  });

  app.post('/api/v1/duties', (req, res) => {
    const {
      ledger_id,
      duty_title,
      assigned_name,
      assigned_user_id,
      is_guest = false,
      approval_required = false,
    } = req.body;

    if (!duty_title || !assigned_name) {
      return res.status(400).json({ error: '당번 과업명과 담당자를 입력해주세요.' });
    }

    const newDuty: MoaDuty = {
      duty_id: `duty-${Date.now()}`,
      ledger_id: ledger_id || LEDGERS[1].ledger_id,
      duty_title,
      assigned_user_id: is_guest ? undefined : assigned_user_id || DEFAULT_USER.user_id,
      assigned_name,
      is_guest: Boolean(is_guest),
      approval_required: Boolean(approval_required),
      status: 'ASSIGNED',
      created_at: new Date().toISOString(),
    };

    MOA_DUTIES.unshift(newDuty);
    res.status(201).json(newDuty);
  });

  // Submit proof (ASSIGNED -> ENDED)
  app.post('/api/v1/duties/:id/proof', (req, res) => {
    const { id } = req.params;
    const { proof_image_url } = req.body;
    const duty = MOA_DUTIES.find((d) => d.duty_id === id);
    if (!duty) return res.status(404).json({ error: '당번 과업을 찾을 수 없습니다.' });

    duty.status = 'ENDED';
    duty.proof_image_url =
      proof_image_url ||
      'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=60';
    duty.submitted_at = new Date().toISOString();

    // If approval is not required, it can directly count as fulfilled or proceed to completed
    if (!duty.approval_required) {
      duty.status = 'COMPLETED';
      duty.approved_at = new Date().toISOString();
    }

    res.json({ success: true, duty });
  });

  // Approve duty (ENDED -> COMPLETED)
  app.post('/api/v1/duties/:id/approve', (req, res) => {
    const { id } = req.params;
    const duty = MOA_DUTIES.find((d) => d.duty_id === id);
    if (!duty) return res.status(404).json({ error: '당번 과업을 찾을 수 없습니다.' });

    duty.status = 'COMPLETED';
    duty.approved_by = DEFAULT_USER.user_id;
    duty.approved_at = new Date().toISOString();

    res.json({ success: true, duty });
  });

  // 7. MoaAllowance (모아용돈)
  app.get('/api/v1/allowance', (req, res) => {
    res.json(MOA_ALLOWANCES);
  });

  app.post('/api/v1/allowance/request', (req, res) => {
    const { amount, reason, requester_name = '구민우(자녀)' } = req.body;
    if (!amount || !reason) {
      return res.status(400).json({ error: '요청 금액과 사유를 입력해주세요.' });
    }

    const newReq: MoaAllowance = {
      allowance_id: `alw-${Date.now()}`,
      requester_id: 'u-1003-child',
      requester_name,
      approver_id: DEFAULT_USER.user_id,
      approver_name: DEFAULT_USER.nickname,
      amount: Number(amount),
      reason,
      status: 'REQUESTED',
      created_at: new Date().toISOString(),
    };

    MOA_ALLOWANCES.unshift(newReq);
    res.status(201).json(newReq);
  });

  app.post('/api/v1/allowance/:id/pay', (req, res) => {
    const { id } = req.params;
    const { payment_method = 'TOSS' } = req.body;
    const alw = MOA_ALLOWANCES.find((a) => a.allowance_id === id);
    if (!alw) return res.status(404).json({ error: '용돈 요청을 찾을 수 없습니다.' });

    alw.status = 'PAID';
    alw.paid_at = new Date().toISOString();
    alw.payment_method = payment_method;

    // Guardrail: Register in group ledger as internal family transfer (is_asset_transfer = true)
    // so living expenses budget is not double-counted
    const familyLedger = LEDGERS.find((l) => l.ledger_type === 'GROUP') || LEDGERS[0];
    TRANSACTIONS.unshift({
      transaction_id: `tx-alw-${Date.now()}`,
      ledger_id: familyLedger.ledger_id,
      user_id: DEFAULT_USER.user_id,
      transaction_type: 'TRANSFER',
      amount: alw.amount,
      merchant_name: `${alw.requester_name} 용돈 지급 (${payment_method})`,
      category_name: '가족 내부 이동',
      transaction_date: new Date().toISOString(),
      is_asset_transfer: true, // Prevents duplicate expense counting!
      created_at: new Date().toISOString(),
      note: `모아용돈 지급 완료: ${alw.reason}`,
    });

    res.json({ success: true, allowance: alw });
  });

  // 8. MoaLoan (모아빌림)
  app.get('/api/v1/loans', (req, res) => {
    res.json(MOA_LOANS);
  });

  app.post('/api/v1/loans', (req, res) => {
    const { borrower_name, amount, due_date, note } = req.body;
    if (!borrower_name || !amount || !due_date) {
      return res.status(400).json({ error: '차용인, 금액 및 변제 예정일을 입력해주세요.' });
    }

    const newLoan: MoaLoan = {
      loan_id: `loan-${Date.now()}`,
      lender_id: DEFAULT_USER.user_id,
      lender_name: DEFAULT_USER.nickname,
      borrower_id: `u-borrower-${Date.now()}`,
      borrower_name,
      amount: Number(amount),
      remaining_amount: Number(amount),
      due_date,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      repayments: [],
    };

    MOA_LOANS.unshift(newLoan);

    // Register as Asset/Liability transfer (NOT consumption expense)
    const activeLedger = LEDGERS[0];
    TRANSACTIONS.unshift({
      transaction_id: `tx-loan-${Date.now()}`,
      ledger_id: activeLedger.ledger_id,
      user_id: DEFAULT_USER.user_id,
      transaction_type: 'TRANSFER',
      amount: Number(amount),
      merchant_name: `[모아빌림] ${borrower_name} 대여`,
      category_name: '자산 이동 / 채권·부채',
      transaction_date: new Date().toISOString(),
      is_asset_transfer: true, // Crucial: separate from living expense stats!
      created_at: new Date().toISOString(),
      note: note || `만기 변제 예정일: ${due_date}`,
    });

    res.status(201).json(newLoan);
  });

  app.post('/api/v1/loans/:id/repay', (req, res) => {
    const { id } = req.params;
    const { amount, note = '상환금 입금' } = req.body;
    const loan = MOA_LOANS.find((l) => l.loan_id === id);
    if (!loan) return res.status(404).json({ error: '대여 내역을 찾을 수 없습니다.' });

    const payAmt = Math.min(Number(amount), loan.remaining_amount);
    loan.remaining_amount -= payAmt;
    loan.repayments.push({
      date: new Date().toISOString().slice(0, 10),
      amount: payAmt,
      note,
    });

    if (loan.remaining_amount <= 0) {
      loan.status = 'FULLY_PAID';
    } else {
      loan.status = 'PARTIAL_PAID';
    }

    // Asset recovery transaction
    const activeLedger = LEDGERS[0];
    TRANSACTIONS.unshift({
      transaction_id: `tx-repay-${Date.now()}`,
      ledger_id: activeLedger.ledger_id,
      user_id: DEFAULT_USER.user_id,
      transaction_type: 'TRANSFER',
      amount: payAmt,
      merchant_name: `[모아빌림 상환] ${loan.borrower_name}`,
      category_name: '자산 회수 / 채권 회수',
      transaction_date: new Date().toISOString(),
      is_asset_transfer: true,
      created_at: new Date().toISOString(),
      note: `대여금 상환 (잔여: ${loan.remaining_amount.toLocaleString()}원)`,
    });

    res.json({ success: true, loan });
  });

  // -------------------------------------------------------------
  // Dev & Static Serving Setup
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MoaBogo] Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[MoaBogo] Fatal startup error:', err);
  process.exit(1);
});
