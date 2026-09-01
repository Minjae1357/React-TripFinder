import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .error-page-container {
          min-height: calc(100vh - 140px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: #F8FAFC;
        }

        .error-content-card {
          background: #FFFFFF;
          border: 1px solid var(--border, #E2E8F0);
          border-radius: 20px;
          padding: 60px 40px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
        }

        .error-illustration {
          position: relative;
          display: inline-block;
          margin-bottom: 24px;
        }

        .error-code {
          font-family: 'Outfit', sans-serif;
          font-size: 88px;
          font-weight: 900;
          line-height: 1;
          color: #E2E8F0;
          letter-spacing: -2px;
          user-select: none;
        }

        .error-badge-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 40px;
          animation: float 2.5s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-8px);
          }
        }

        .error-title {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--foreground, #0F172A);
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .error-desc {
          font-size: 14.5px;
          color: var(--muted-foreground, #64748B);
          line-height: 1.6;
          margin-bottom: 32px;
          word-break: keep-all;
        }

        .error-actions-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .btn-error-home {
          padding: 12px 24px;
          background: var(--primary, #1D4ED8);
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-error-home:hover {
          background: #1A44B8;
          transform: translateY(-1px);
        }

        .btn-error-back {
          padding: 12px 20px;
          background: #FFFFFF;
          color: var(--foreground, #334155);
          border: 1.5px solid var(--border, #E2E8F0);
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-error-back:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }

        @media (max-width: 480px) {
          .error-content-card {
            padding: 40px 20px;
          }
          .error-actions-group {
            flex-direction: column;
            width: 100%;
          }
          .btn-error-home, .btn-error-back {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="error-page-container">
        <div className="error-content-card">
          <div className="error-illustration">
            <div className="error-code">404</div>
          </div>

          <h2 className="error-title">길을 잃으셨나요?</h2>
          <p className="error-desc">
            요청하신 페이지를 찾을 수 없습니다.<br />
            입력하신 주소가 정확한지 다시 한번 확인해 주세요.
          </p>

          <div className="error-actions-group">
            <button
              type="button"
              className="btn-error-back"
              onClick={() => navigate(-1)}
            >
              이전으로
            </button>
            <button
              type="button"
              className="btn-error-home"
              onClick={() => navigate('/')}
            >
              홈으로 가기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorPage;