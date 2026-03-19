"use client";


export default function PrivacyPage() {
  return (
    <div className="min-h-screen max-w-lg mx-auto px-5 py-8">
      <a href="/login" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← 돌아가기</a>
      <h1 className="text-2xl font-bold mb-6">개인정보 처리방침</h1>
      <div className="prose prose-sm text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-bold mt-0">1. 수집하는 개인정보</h2>
          <p><strong>필수 항목:</strong> 이메일 주소, 이름(닉네임), 소셜 로그인 식별자</p>
          <p><strong>선택 항목:</strong> 부모(보호자) 이메일 주소 (리포트 발송 시)</p>
          <p><strong>자동 수집:</strong> 학습 진도(미션 완수 기록), 서비스 이용 기록</p>
        </section>

        <section>
          <h2 className="text-lg font-bold">2. 수집 및 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 식별 및 서비스 제공</li>
            <li>학습 진도 관리 및 미션 리포트 발송</li>
            <li>서비스 개선 및 신규 서비스 안내</li>
            <li>교육 관련 정보 및 이벤트 안내 (동의 시)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold">3. 보관 기간</h2>
          <p>회원 탈퇴 시 지체 없이 파기합니다. 단, 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>전자상거래법에 따른 계약/결제 기록: 5년</li>
            <li>통신비밀보호법에 따른 접속 기록: 3개월</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold">4. 제3자 제공</h2>
          <p>수집된 개인정보는 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우 예외로 합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령에 의해 요구되는 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold">5. 위탁 처리</h2>
          <p>서비스 운영을 위해 다음 업체에 개인정보 처리를 위탁합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Supabase Inc. — 회원 인증 및 데이터 저장</li>
            <li>Resend Inc. — 이메일 발송</li>
            <li>Cloudflare Inc. — 웹사이트 호스팅</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold">6. 이용자의 권리</h2>
          <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>개인정보 열람, 정정, 삭제 요청</li>
            <li>처리 정지 요청</li>
            <li>회원 탈퇴</li>
            <li>이메일 수신 거부</li>
          </ul>
          <p>문의: <a href="mailto:dailyseed.com@gmail.com" className="text-amber-600">dailyseed.com@gmail.com</a></p>
        </section>

        <section>
          <h2 className="text-lg font-bold">7. 개인정보 보호책임자</h2>
          <p>이메일: dailyseed.com@gmail.com</p>
        </section>

        <p className="text-xs text-gray-400 pt-4 border-t">시행일: 2026년 3월 16일</p>
      </div>
    </div>
  );
}
