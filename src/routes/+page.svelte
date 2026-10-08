<script lang="ts">
  let question = $state('');
  let name = $state('');
  let isSubmitting = $state(false);
  let submitted = $state(false);
  let errorMessage = $state('');

  async function submitQuestion(event: SubmitEvent) {
    event.preventDefault();
    errorMessage = '';
    isSubmitting = true;

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, name })
      });
      const result = await response.json();

      if (!response.ok) {
        errorMessage = result.error ?? 'ส่งคำถามไม่สำเร็จ กรุณาลองใหม่';
        return;
      }

      submitted = true;
      question = '';
      name = '';
    } catch {
      errorMessage = 'เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>FleurVive's Letter Box</title>
  <meta
    name="description"
    content="เขียนจดหมายถึง FleurVive ฝากคำถาม คำบอกรัก หรือข้อความถึงเมมเบอร์ได้ จะใส่ชื่อหรือส่งแบบนิรนามก็ได้"
  />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="FleurVive's Letter Box" />
  <meta property="og:title" content="FleurVive's Letter Box" />
  <meta
    property="og:description"
    content="เขียนจดหมายถึง FleurVive ฝากคำถาม คำบอกรัก หรือข้อความถึงเมมเบอร์ได้ จะใส่ชื่อหรือส่งแบบนิรนามก็ได้"
  />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="FleurVive's Letter Box" />
  <meta
    name="twitter:description"
    content="เขียนจดหมายถึง FleurVive ฝากคำถาม คำบอกรัก หรือข้อความถึงเมมเบอร์ได้ จะใส่ชื่อหรือส่งแบบนิรนามก็ได้"
  />
</svelte:head>

<div class="page-shell">
  <main class="main-content">
    <section class="content-column letter-column">
      <div class="mailbox-illustration" aria-hidden="true">
        <svg viewBox="0 0 180 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M85 104V139" stroke="#A78A76" stroke-width="9" stroke-linecap="round" />
          <path d="M67 140H103" stroke="#A78A76" stroke-width="8" stroke-linecap="round" />
          <path d="M43 53C43 38.088 55.088 26 70 26H110C124.912 26 137 38.088 137 53V105H43V53Z" fill="#FF9B91" />
          <path d="M52 55C52 45.611 59.611 38 69 38H111C120.389 38 128 45.611 128 55V96H52V55Z" fill="#FFD8CF" />
          <path d="M69 67H111" stroke="#8B6A62" stroke-width="7" stroke-linecap="round" />
          <path d="M67 83H108" stroke="#FDF9F4" stroke-width="5" stroke-linecap="round" />
          <path d="M118 35V13" stroke="#7660D8" stroke-width="4" stroke-linecap="round" />
          <path d="M120 14L148 22L120 30V14Z" fill="#8C78E7" />
          <path d="M28 32L31 40L39 43L31 46L28 54L25 46L17 43L25 40L28 32Z" fill="#F4C965" />
          <path d="M151 71L153 76L158 78L153 80L151 85L149 80L144 78L149 76L151 71Z" fill="#79BFA1" />
          <path d="M31 100C31 100 33 92 40 92C47 92 49 100 49 100C49 100 47 108 40 108C33 108 31 100 31 100Z" fill="#FFF9F1" stroke="#E9D9CE" stroke-width="2" />
          <path d="M33 95L40 101L47 95" stroke="#E9D9CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="eyebrow"><span class="eyebrow-dot"></span> จดหมายถึง FleurVive</div>
      <h1>FleurVive's Letter Box</h1>
      <p class="intro">
        มีคำถามสงสัย/อยากบอกรัก/อยากบ่นระบาย/แนะนำ-ติชมทีมงาน<br/>
        เขียนฝากไว้ในตู้จดหมายได้เลย ข้อความของคุณจะส่งต่อให้เมมเบอร์อ่านในงานออฟไค 🌷
      </p>

      {#if submitted}
        <div class="card success-card">
          <div class="success-emoji" aria-hidden="true">💌</div>
          <h2>ส่งจดหมายเรียบร้อย!</h2>
          <p>ขอบคุณที่เขียนมาหา พวกเราได้รับข้อความแล้ว :)</p>
          <button class="secondary-button" type="button" onclick={() => (submitted = false)}>
            เขียนอีกฉบับ
          </button>
        </div>
      {:else}
        <form class="card form-card letter-form-card" onsubmit={submitQuestion}>
          <label class="field-label" for="question">
            <span>เขียนข้อความของคุณ</span>
            <span class="field-hint">{question.length}/500</span>
          </label>
          <textarea
            id="question"
            bind:value={question}
            maxlength="500"
            placeholder="ถึง FleurVive... อยากบอกอะไร เขียนไว้ตรงนี้ได้เลย"
            required
          ></textarea>

          <div class="name-field">
            <label class="field-label" for="name">
              <span>จาก</span>
              <span class="field-hint">ไม่ใส่ก็ได้</span>
            </label>
            <input
              class="text-input"
              id="name"
              bind:value={name}
              maxlength="80"
              placeholder="ชื่อผู้ส่ง หรือส่งแบบนิรนาม"
              autocomplete="name"
            />
          </div>

          {#if errorMessage}
            <p class="form-error" role="alert">{errorMessage}</p>
          {/if}

          <div class="form-bottom">
            <p class="privacy-note">ไม่เขียนชื่อก็ได้นะ จดหมายจะแสดงเป็น “นิรนาม”</p>
            <button class="primary-button letter-submit" type="submit" disabled={isSubmitting || !question.trim()}>
              {isSubmitting ? 'กำลังส่งจดหมาย…' : 'ส่งจดหมาย'}
              <img src="/mail.png" alt="" aria-hidden="true" />
            </button>
          </div>
        </form>
      {/if}
    </section>
  </main>

  <footer class="footer">
    <span>ทุกข้อความมีความหมาย ขอบคุณที่เขียนมานะ 💛</span>
    <span>FleurVive · Letter Box</span>
  </footer>
</div>
