// DOM 요소가 로드되면 실행[cite: 3]
document.addEventListener('DOMContentLoaded', () => {
    // 1. 오타가 있는 ID(laon-form)와 정상 ID(loan-form) 모두 탐색
    const form = document.getElementById('laon-form') || document.getElementById('loan-form'); //[cite: 3, 4]
    const submitBtn = document.getElementById('submit-btn'); //[cite: 3, 4]
    const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null; //[cite: 3, 4]
    const formError = document.getElementById('form-error'); //[cite: 3, 4]

    // 결과 표시 영역 DOM 요소들 가져오기[cite: 3]
    const resultEmpty = document.getElementById('result-empty'); //[cite: 3, 4]
    const resultContent = document.getElementById('result-content'); //[cite: 3, 4]
    const gaugePercent = document.getElementById('gauge-percent'); //[cite: 3, 4]
    const gaugeFill = document.getElementById('gauge-fill'); //[cite: 3, 4]
    const decisionBadge = document.getElementById('decision-badge'); //[cite: 3, 4]
    const riskGrade = document.getElementById('risk-grade'); //[cite: 3, 4]
    const requestId = document.getElementById('request-id'); //[cite: 3, 4]
    const timestamp = document.getElementById('timestamp'); //[cite: 3, 4]

    // 예측 처리 함수 정의
    const handlePredict = async (event) => {
        // 기본 제출/이벤트 동작 방지 (페이지 새로고침 방지)[cite: 3]
        if (event) event.preventDefault();

        // 기존 에러 메시지 초기화[cite: 3]
        if (formError) formError.textContent = '';

        // input 요소에서 값 안전하게 읽어오는 헬퍼 함수
        const getValue = (name) => {
            const el = document.querySelector(`[name="${name}"]`);
            return el ? el.value : '';
        };

        // API 규격에 맞추어 숫자는 Number()로 변환하여 요청 데이터 생성[cite: 3]
        const payload = {
            age: Number(getValue('age')), // 나이 (숫자)[cite: 3]
            gender: getValue('gender'), // 성별[cite: 3]
            annual_income: Number(getValue('annual_income')), // 연소득 (숫자)[cite: 3]
            employment_years: Number(getValue('employment_years')), // 근속연수 (숫자)[cite: 3]
            housing_type: getValue('housing_type'), // 주거형태[cite: 3]
            credit_score: Number(getValue('credit_score')), // 신용점수 (숫자)[cite: 3]
            existing_loan_count: Number(getValue('existing_loan_count')), // 기존 대출 건수 (숫자)[cite: 3]
            annual_card_usage: Number(getValue('annual_card_usage')), // 연간 카드 사용액 (숫자)[cite: 3]
            debt_ratio: Number(getValue('debt_ratio') || getValue('dept_ratio')), // 부채비율 (HTML 오타 dept_ratio 감지 대응)[cite: 3]
            loan_amount: Number(getValue('loan_amount') || getValue('loan_count')), // 대출 신청액 (HTML 오타 loan_count 감지 대응)[cite: 3]
            loan_purpose: getValue('loan_purpose'), // 대출 목적[cite: 3]
            repayment_method: getValue('repayment_method'), // 상환 방식[cite: 3]
            loan_period: Number(getValue('loan_period')) // 대출 기간 (숫자)[cite: 3]
        };

        try {
            // 버튼 상태를 로딩 중으로 변경[cite: 3]
            if (submitBtn) submitBtn.disabled = true; //[cite: 3]
            if (btnSpinner) btnSpinner.hidden = false; //[cite: 3]

            // POST /predict API 호출[cite: 3]
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' //[cite: 3]
                },
                body: JSON.stringify(payload) //[cite: 3]
            });

            const data = await response.json(); //[cite: 3]

            // HTTP 422, 503 등 에러 발생 시 처리[cite: 3]
            if (!response.ok) {
                const errorMsg = data.detail || `요청 실패 (상태 코드: ${response.status})`; //[cite: 3]
                throw new Error(errorMsg); //[cite: 3]
            }

            // 요청 성공 시 결과 UI 업데이트[cite: 3]
            if (resultEmpty) resultEmpty.hidden = true; //[cite: 3]
            if (resultContent) resultContent.hidden = false; //[cite: 3]

            // 승인 확률 백분율 계산 및 출력[cite: 3]
            const percentValue = Math.round(data.probability * 100); //[cite: 3]
            if (gaugePercent) gaugePercent.textContent = `${percentValue}%`; //[cite: 3]

            // 게이지 바 애니메이션 적용[cite: 3]
            if (gaugeFill) {
                const dashArray = 439.8; //[cite: 3]
                const dashOffset = dashArray - (dashArray * data.probability); //[cite: 3]
                gaugeFill.style.strokeDashoffset = dashOffset; //[cite: 3]
            }

            // 승인 여부 배지 표시[cite: 3]
            if (decisionBadge) {
                if (data.approved) {
                    decisionBadge.textContent = '승인 가능'; //[cite: 3]
                    decisionBadge.className = 'decision-badge decision-badge--approved'; //[cite: 3]
                } else {
                    decisionBadge.textContent = '승인 거절'; //[cite: 3]
                    decisionBadge.className = 'decision-badge decision-badge--rejected'; //[cite: 3]
                }
            }

            // 등급, 요청 ID, 시각 업데이트[cite: 3]
            if (riskGrade) {
                riskGrade.textContent = data.risk_grade; //[cite: 3]
                riskGrade.className = `grade-pill grade-pill--${data.risk_grade}`; //[cite: 3]
            }
            if (requestId) requestId.textContent = data.request_id; //[cite: 3]
            if (timestamp) timestamp.textContent = data.timestamp; //[cite: 3]

        } catch (err) {
            // 실패 시 에러 메시지 화면에 표시[cite: 3]
            if (formError) formError.textContent = err.message; //[cite: 3]
        } finally {
            // 버튼 상태 원복[cite: 3]
            if (submitBtn) submitBtn.disabled = false; //[cite: 3]
            if (btnSpinner) btnSpinner.hidden = true; //[cite: 3]
        }
    };

    // 폼 제출 이벤트 연결[cite: 3]
    if (form) form.addEventListener('submit', handlePredict); //[cite: 3]

    // HTML 태그가 바로 닫혀 폼 제출이 안 될 경우를 대비해 버튼 클릭 이벤트도 직접 연결
    if (submitBtn) submitBtn.addEventListener('click', handlePredict);
});