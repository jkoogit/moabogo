#!/usr/bin/env node
/**
 * agentwork/gh-cli.cjs
 * MoaBogo Agent Harness GitHub CLI Tool
 *
 * 지원 기능:
 * 1. 4단계 GitHub 토큰 자동 감지 (Env -> AI Studio /proc -> .env -> Git remote origin URL)
 * 2. status : 오픈 이슈, 오픈 PR, 원격 브랜치(dev, stg, main) SHA 일치성 통합 조회
 * 3. create-issue : 이슈 생성 (--title, --body, --labels)
 * 4. close-issue : 이슈 종결 (--issue <num>)
 * 5. create-pr : PR 생성 (--title, --head, --base [기본 dev], --body)
 * 6. merge-pr : PR 머지 (--pr <num>, --method [merge|squash|rebase])
 * 7. sync-branches : dev -> stg, main 패스트포워드 푸시 및 3개 브랜치 SHA 검증
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

// 1. 4단계 GitHub 토큰 자동 감지
function resolveGitHubToken() {
  // 계층 1: 환경 변수
  let token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token && token.trim()) return token.trim();

  // 계층 2: Google AI Studio Secrets (/proc/*/environ)
  try {
    if (process.platform === 'linux' && fs.existsSync('/proc')) {
      const pids = fs.readdirSync('/proc').filter((name) => /^\d+$/.test(name));
      for (const pid of pids) {
        const envPath = `/proc/${pid}/environ`;
        if (fs.existsSync(envPath)) {
          try {
            const raw = fs.readFileSync(envPath, 'utf-8');
            const match = raw.match(/GITHUB_TOKEN=([^\0\n]+)/);
            if (match && match[1]) {
              return match[1].trim();
            }
          } catch (_) {}
        }
      }
    }
  } catch (_) {}

  // 계층 3: .env 파일
  try {
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf-8');
      const match = envContent.match(/^(?:GITHUB_TOKEN|GH_TOKEN)=(.*)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  } catch (_) {}

  // 계층 3.5: GitHub CLI (gh auth token)
  try {
    const ghToken = execSync('gh auth token', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (ghToken) {
      return ghToken;
    }
  } catch (_) {}

  // 계층 4: Git remote origin URL 역추출
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
    const tokenMatch = remoteUrl.match(/x-access-token:([^@]+)@/);
    if (tokenMatch && tokenMatch[1]) {
      return tokenMatch[1].trim();
    }
  } catch (_) {}

  return null;
}

const GITHUB_TOKEN = resolveGitHubToken();
const REPO_OWNER = 'jkoogit';
const REPO_NAME = 'moabogo';

// GitHub REST API 호출 헬퍼
function ghRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    if (!GITHUB_TOKEN) {
      return reject(new Error('GitHub Token이 감지되지 않았습니다. (.env 또는 GITHUB_TOKEN 환경변수 확인 필요)'));
    }

    const opts = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'MoaBogo-Agentwork-CLI',
        Accept: 'application/vnd.github+json',
      },
    };
    if (data) opts.headers['Content-Type'] = 'application/json';

    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (_) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// CLI 인자 파서
function parseArgs(args) {
  const result = { command: args[0], flags: {} };
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        result.flags[key] = next;
        i++;
      } else {
        result.flags[key] = true;
      }
    }
  }
  return result;
}

async function handleStatus() {
  console.log('====================================================');
  console.log('🔍 MoaBogo GitHub 상태 통합 점검 (agentwork/gh-cli)');
  console.log('====================================================');
  console.log(`GitHub Token 감지 상태: ${GITHUB_TOKEN ? '✓ 정상 감지됨' : '✗ 미감지'}`);

  // 1. 현재 로컬 브랜치
  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    console.log(`현재 로컬 브랜치: ${currentBranch}`);
  } catch (_) {}

  // 2. 오픈 이슈 목록
  try {
    const issuesRes = await ghRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=open`);
    if (issuesRes.status === 200 && Array.isArray(issuesRes.data)) {
      // PR은 issues API에도 포함되므로 pull_request 속성이 없는 것만 필터
      const pureIssues = issuesRes.data.filter((item) => !item.pull_request);
      console.log(`\n📋 오픈 이슈: ${pureIssues.length}건`);
      pureIssues.forEach((i) => {
        console.log(`  - #${i.number}: ${i.title}`);
      });
    }
  } catch (err) {
    console.error('이슈 조회 실패:', err.message);
  }

  // 3. 오픈 PR 목록
  try {
    const pullsRes = await ghRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open`);
    if (pullsRes.status === 200 && Array.isArray(pullsRes.data)) {
      console.log(`\n🔀 오픈 PR: ${pullsRes.data.length}건`);
      pullsRes.data.forEach((p) => {
        console.log(`  - PR #${p.number} [${p.head.ref} -> ${p.base.ref}]: ${p.title}`);
      });
    }
  } catch (err) {
    console.error('PR 조회 실패:', err.message);
  }

  // 4. 원격 브랜치 SHA 일치 검증
  try {
    const lsRemote = execSync(`git ls-remote origin dev stg main`, { encoding: 'utf-8' }).trim();
    console.log(`\n🌐 원격 브랜치 상태 (dev, stg, main):`);
    const lines = lsRemote.split('\n');
    const branchMap = {};
    lines.forEach((line) => {
      const [sha, ref] = line.trim().split(/\s+/);
      const name = ref ? ref.replace('refs/heads/', '') : '';
      if (name) branchMap[name] = sha;
      console.log(`  ${name.padEnd(8)}: ${sha}`);
    });

    const isSynced = branchMap.dev && branchMap.dev === branchMap.stg && branchMap.dev === branchMap.main;
    console.log(`  ➔ 3개 브랜치 동기화 일치 여부: ${isSynced ? '✓ 100% 일치' : '⚠️ 불일치 발생'}`);
  } catch (err) {
    console.error('원격 브랜치 조회 실패:', err.message);
  }
}

async function handleCreateIssue(flags) {
  const title = flags.title;
  const body = flags.body || '';
  const labels = flags.labels ? flags.labels.split(',').map((l) => l.trim()) : ['enhancement'];

  if (!title) {
    console.error('오류: --title 파라미터가 필요합니다.');
    process.exit(1);
  }

  console.log(`🚀 이슈 생성 요청: "${title}"`);
  const res = await ghRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/issues`, 'POST', {
    title,
    body,
    labels,
  });

  if (res.status === 201) {
    console.log(`✓ 이슈 생성 완료: #${res.data.number} (${res.data.html_url})`);
  } else {
    console.error(`✗ 이슈 생성 실패 (HTTP ${res.status}):`, res.data || res.raw);
    process.exit(1);
  }
}

async function handleCloseIssue(flags) {
  const issueNum = flags.issue || flags.number;
  if (!issueNum) {
    console.error('오류: --issue <번호> 파라미터가 필요합니다.');
    process.exit(1);
  }

  console.log(`🔒 이슈 종결 처리 요청: #${issueNum}`);
  const res = await ghRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNum}`, 'PATCH', {
    state: 'closed',
    state_reason: 'completed',
  });

  if (res.status === 200) {
    console.log(`✓ 이슈 #${issueNum} 종결(Closed) 완료`);
  } else {
    console.error(`✗ 이슈 종결 실패 (HTTP ${res.status}):`, res.data || res.raw);
    process.exit(1);
  }
}

async function handleCreatePr(flags) {
  const title = flags.title;
  const head = flags.head;
  const base = flags.base || 'dev';
  const body = flags.body || '';

  if (!title || !head) {
    console.error('오류: --title 및 --head 파라미터가 필요합니다.');
    process.exit(1);
  }

  console.log(`🚀 PR 생성 요청: [${head} -> ${base}] "${title}"`);
  const res = await ghRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/pulls`, 'POST', {
    title,
    head,
    base,
    body,
  });

  if (res.status === 201) {
    console.log(`✓ PR 생성 완료: #${res.data.number} (${res.data.html_url})`);
  } else {
    console.error(`✗ PR 생성 실패 (HTTP ${res.status}):`, res.data || res.raw);
    process.exit(1);
  }
}

async function handleMergePr(flags) {
  const prNum = flags.pr || flags.number;
  const method = flags.method || 'merge';

  if (!prNum) {
    console.error('오류: --pr <번호> 파라미터가 필요합니다.');
    process.exit(1);
  }

  console.log(`🔀 PR 머지 요청: PR #${prNum} (방식: ${method})`);
  const res = await ghRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${prNum}/merge`, 'PUT', {
    merge_method: method,
  });

  if (res.status === 200 && res.data.merged) {
    console.log(`✓ PR #${prNum} 머지 완결 (${res.data.sha})`);
  } else {
    console.error(`✗ PR 머지 실패 (HTTP ${res.status}):`, res.data || res.raw);
    process.exit(1);
  }
}

async function handleSyncBranches() {
  console.log('🔄 원격 dev 브랜치 기준으로 stg, main 패스트포워드 배포 동기화 실행...');
  try {
    execSync('git fetch origin dev', { stdio: 'inherit' });
    execSync('git push origin origin/dev:refs/heads/stg origin/dev:refs/heads/main', { stdio: 'inherit' });
    console.log('\n✓ 원격 stg, main 푸시 완료. 3개 브랜치 SHA 검증:');
    const lsRemote = execSync('git ls-remote origin dev stg main', { encoding: 'utf-8' }).trim();
    console.log(lsRemote);
  } catch (err) {
    console.error('브랜치 동기화 실패:', err.message);
    process.exit(1);
  }
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));

  if (!command || command === 'help' || command === '--help') {
    console.log(`
MoaBogo Agentwork GitHub CLI Tool
사용법:
  node agentwork/gh-cli.cjs <명령어> [옵션]

명령어 목록:
  status                                          오픈 이슈, 오픈 PR, 원격 브랜치 SHA 점검
  create-issue --title "제목" [--body "내용"]      신규 이슈 등록
  close-issue --issue <번호>                      이슈 완료(Closed) 처리
  create-pr --title "제목" --head "브랜치"        신규 PR 생성 (기본 base: dev)
  merge-pr --pr <번호> [--method merge|squash]    PR 머지 실행
  sync-branches                                   dev 커밋을 stg, main에 패스트포워드 푸시
`);
    return;
  }

  try {
    switch (command) {
      case 'status':
        await handleStatus();
        break;
      case 'create-issue':
        await handleCreateIssue(flags);
        break;
      case 'close-issue':
        await handleCloseIssue(flags);
        break;
      case 'create-pr':
        await handleCreatePr(flags);
        break;
      case 'merge-pr':
        await handleMergePr(flags);
        break;
      case 'sync-branches':
        await handleSyncBranches();
        break;
      default:
        console.error(`알 수 없는 명령어: ${command}`);
        process.exit(1);
    }
  } catch (err) {
    console.error('실행 중 예외 발생:', err);
    process.exit(1);
  }
}

main();
