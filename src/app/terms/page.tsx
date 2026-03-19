"use client";


export default function TermsPage() {
  return (
    <div className="min-h-screen max-w-lg mx-auto px-5 py-8">
      <a href="/login" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← 돌아가기</a>
      <h1 className="text-2xl font-bold mb-6">이용약관</h1>
      <div className="prose prose-sm text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-bold mt-0">제1조 (목적)</h2>
          <p>본 약관은 DailySeed(이하 &quot;서비스&quot;)가 제공하는 청소년 교양 교육 서비스의 이용 조건 및 절차에 관한 사항을 규정합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold">제2조 (서비스 내용)</h2>
          <p>서비스는 매일 뉴스, 고전, 예술, 세계, 과학, 영어 등 6개 분야의 교양 콘텐츠를 제공하며, 학습 미션 완수 시 부모(보호자)에게 이메일 리포트를 발송합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold">제3조 (회원가입 및 탈퇴)</h2>
          <p>1. 회원가입은 카카오 또는 Google 계정을 통한 소셜 로그인으로 이루어집니다.</p>
          <p>2. 회원은 언제든지 서비스 내 프로필 페이지에서 탈퇴를 요청할 수 있으며, 탈퇴 시 개인정보는 지체 없이 파기됩니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold">제4조 (이메일 수신)</h2>
          <p>1. 서비스는 학습 리포트, 서비스 안내, 교육 관련 정보를 이메일로 발송할 수 있습니다.</p>
          <p>2. 광고성 이메일은 별도 동의를 받은 경우에만 발송하며, 모든 이메일에 수신 거부 방법을 안내합니다.</p>
          <p>3. 회원은 언제든지 이메일 수신을 거부할 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold">제5조 (면책)</h2>
          <p>서비스가 제공하는 콘텐츠는 교육 목적의 참고 자료이며, 정확성을 보증하지 않습니다. 콘텐츠 이용으로 인한 손해에 대해 서비스는 책임을 지지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold">제6조 (약관 변경)</h2>
          <p>서비스는 약관을 변경할 수 있으며, 변경 시 서비스 내 공지 또는 이메일로 안내합니다.</p>
        </section>

        <p className="text-xs text-gray-400 pt-4 border-t">시행일: 2026년 3월 16일</p>
      </div>
    </div>
  );
}
