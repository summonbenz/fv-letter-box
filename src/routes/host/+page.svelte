<script lang="ts">
  import { onMount } from 'svelte';

  interface Question {
    id: string;
    question: string;
    name: string;
    createdAt: string;
    status: 'pending' | 'answered';
  }

  const passwordKey = 'qanda-admin-password';
  let password = $state('');
  let enteredPassword = $state('');
  let unlocked = $state(false);
  let loading = $state(false);
  let updating = $state(false);
  let questions = $state<Question[]>([]);
  let currentQuestion = $state<Question | null>(null);
  let errorMessage = $state('');

  let pendingQuestions = $derived(questions.filter((item) => item.status === 'pending'));

  onMount(() => {
    const savedPassword = sessionStorage.getItem(passwordKey);
    if (savedPassword) {
      password = savedPassword;
      void loadQuestions();
    }
  });

  function pickRandom(excludeId?: string) {
    let candidates = pendingQuestions;
    if (excludeId && candidates.length > 1) {
      candidates = candidates.filter((item) => item.id !== excludeId);
    }
    if (!candidates.length) {
      currentQuestion = null;
      return;
    }
    currentQuestion = candidates[Math.floor(Math.random() * candidates.length)];
  }

  async function loadQuestions() {
    loading = true;
    errorMessage = '';

    try {
      const response = await fetch('/api/admin/questions', {
        headers: { 'x-admin-password': password }
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem(passwordKey);
          unlocked = false;
          enteredPassword = '';
        }
        errorMessage = result.error ?? 'โหลดคำถามไม่สำเร็จ';
        return false;
      }

      questions = result.questions;
      unlocked = true;
      errorMessage = '';
      if (!currentQuestion || !pendingQuestions.some((item) => item.id === currentQuestion?.id)) {
        pickRandom();
      }
      return true;
    } catch {
      errorMessage = 'เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
      return false;
    } finally {
      loading = false;
    }
  }

  async function login(event: SubmitEvent) {
    event.preventDefault();
    password = enteredPassword;
    const success = await loadQuestions();
    if (success) sessionStorage.setItem(passwordKey, password);
  }

  async function markAnswered() {
    if (!currentQuestion) return;
    updating = true;
    errorMessage = '';

    try {
      const response = await fetch(`/api/admin/questions/${encodeURIComponent(currentQuestion.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ status: 'answered' })
      });
      const result = await response.json();

      if (!response.ok) {
        errorMessage = result.error ?? 'อัปเดตสถานะไม่สำเร็จ';
        return;
      }

      const answeredId = currentQuestion.id;
      questions = questions.map((item) =>
        item.id === answeredId ? { ...item, status: 'answered' } : item
      );
      currentQuestion = null;
      pickRandom();
    } catch {
      errorMessage = 'เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง';
    } finally {
      updating = false;
    }
  }

  function skipQuestion() {
    if (currentQuestion) pickRandom(currentQuestion.id);
  }

  function logout() {
    sessionStorage.removeItem(passwordKey);
    password = '';
    enteredPassword = '';
    questions = [];
    currentQuestion = null;
    unlocked = false;
    errorMessage = '';
  }

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
</script>

<svelte:head>
  <title>หน้าผู้ดำเนินรายการ — ถามได้เลย</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="page-shell">
  <header class="topbar">
    <a class="brand" href="/" aria-label="ถามได้เลย หน้าหลัก">
      <span class="brand-mark" aria-hidden="true">✳</span>
      <span class="letter-brand-title">FleurVive's Letter Box</span>
    </a>
    {#if unlocked}
      <div class="host-tools">
        <button class="quiet-button" type="button" onclick={() => loadQuestions()} disabled={loading}>
          {loading ? 'กำลังโหลด…' : '↻ รีเฟรช'}
        </button>
        <button class="quiet-button" type="button" onclick={logout}>ออกจากระบบ</button>
      </div>
    {:else}
      <a class="host-link" href="/">หน้าส่งคำถาม ↗</a>
    {/if}
  </header>

  <main class="main-content">
    <section class="host-column">
      {#if !unlocked}
        <form class="card login-card" onsubmit={login}>
          <div class="login-icon" aria-hidden="true">🔐</div>
          <!-- <div class="eyebrow"><span class="eyebrow-dot"></span> เฉพาะผู้ดำเนินรายการ</div> -->
          <h2>ยินดีต้อนรับหลังเวที</h2>
          <p>ใส่รหัสผ่านผู้ดูแลเพื่อเปิดหน้าสุ่มคำถาม</p>
          {#if errorMessage}
            <div class="error-banner" role="alert">{errorMessage}</div>
          {/if}
          <input
            class="text-input"
            type="password"
            bind:value={enteredPassword}
            placeholder="รหัสผ่านผู้ดูแล"
            autocomplete="current-password"
            required
          />
          <button class="primary-button" type="submit" disabled={loading || !enteredPassword}>
            {loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่หน้าควบคุม'}
            <span aria-hidden="true">➜</span>
          </button>
          <p class="connection-note">รหัสผ่านจะอยู่ในแท็บนี้จนกว่าจะปิดหรือออกจากระบบ</p>
        </form>
      {:else}
        <div class="host-heading-row">
          <div>
            <!-- <div class="eyebrow"><span class="eyebrow-dot"></span> หลังเวที · ควบคุมวงสนทนา</div> -->
            <h1>ข้อความฉบับใหม่…</h1>
            <p class="intro">สุ่มได้เลย ข้ามไว้ก่อน หรือทำเครื่องหมายเมื่อตอบแล้ว</p>
          </div>
          <div class="counter" aria-label={`${pendingQuestions.length} คำถามที่ยังไม่ได้ตอบ`}>
            <strong>{pendingQuestions.length}</strong>
            <span>รอตอบ</span>
          </div>
        </div>

        {#if errorMessage}
          <div class="error-banner" role="alert">{errorMessage}</div>
        {/if}

        {#if currentQuestion}
          <article class="card question-card" aria-live="polite">
            <div class="question-topline">
              <span class="status-pill"><span aria-hidden="true">✦</span> คำถามที่สุ่มได้</span>
              <span class="field-hint">{formatDate(currentQuestion.createdAt)}</span>
            </div>
            <p class="question-text">{currentQuestion.question}</p>
            <div class="question-meta">
              <span class="avatar" aria-hidden="true">{currentQuestion.name === 'นิรนาม' ? '✿' : currentQuestion.name.slice(0, 1)}</span>
              <span>ถามโดย <strong>{currentQuestion.name || 'นิรนาม'}</strong></span>
            </div>
          </article>
          <div class="question-actions">
            <button class="skip-button" type="button" onclick={skipQuestion} disabled={updating}>
              ข้ามไปก่อน <span aria-hidden="true">↻</span>
            </button>
            <button class="answer-button" type="button" onclick={markAnswered} disabled={updating}>
              {updating ? 'กำลังบันทึก…' : 'ตอบคำถามนี้แล้ว'}
              <span aria-hidden="true">{updating ? '⏳' : '✓'}</span>
            </button>
          </div>
        {:else}
          <div class="card empty-card">
            <div class="empty-icon" aria-hidden="true">{loading ? '⏳' : '🌤️'}</div>
            <h2>{loading ? 'กำลังโหลดคำถาม…' : 'หมดคำถามที่รอตอบแล้ว!'}</h2>
            <p>
              {loading
                ? 'ขอเวลาแป๊บเดียว กำลังไปหยิบคำถามมาให้'
                : 'เยี่ยมมาก ตอบครบแล้ว หรือผู้ชมอาจกำลังพิมพ์คำถามใหม่อยู่'}
            </p>
            <button class="secondary-button" type="button" onclick={() => loadQuestions()} disabled={loading}>
              เช็กคำถามใหม่ <span aria-hidden="true">↻</span>
            </button>
          </div>
        {/if}
      {/if}
    </section>
  </main>

  <footer class="footer">
    <span>วงสนทนาที่ดี เริ่มจากคำถามดี ๆ 🌈</span>
    <a class="host-link" href="/">กลับหน้าส่งคำถาม</a>
  </footer>
</div>
