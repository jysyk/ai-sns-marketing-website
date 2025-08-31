/**
 * AI SNS 마케팅 홍보페이지 - 메인 JavaScript 파일
 * 사용자 인터랙션, 폼 처리, 애니메이션 등을 담당합니다.
 */

// DOM 요소들을 저장할 객체
const elements = {
  nav: null,
  mobileMenuBtn: null,
  mobileMenu: null,
  contactForm: null,
  backToTopBtn: null,
  navLinks: null
};

// 애플리케이션 상태 관리
const appState = {
  isMobileMenuOpen: false,
  isScrolled: false,
  lastScrollY: 0
};

/**
 * DOM이 로드되면 초기화 함수 실행
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  initializeEventListeners();
  initializeAnimations();
  
  console.log('AI 마케팅 웹사이트 초기화 완료');
});

/**
 * DOM 요소들을 초기화하는 함수
 * 필요한 요소들을 미리 찾아서 저장해둡니다.
 */
function initializeElements() {
  elements.nav = document.querySelector('nav');
  elements.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  elements.mobileMenu = document.querySelector('.mobile-menu');
  elements.contactForm = document.getElementById('contactForm');
  elements.backToTopBtn = document.getElementById('backToTop');
  elements.navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  
  // 요소가 없을 경우 경고 메시지 출력
  if (!elements.contactForm) {
    console.warn('연락처 폼을 찾을 수 없습니다.');
  }
}

/**
 * 모든 이벤트 리스너를 등록하는 함수
 */
function initializeEventListeners() {
  // 스크롤 이벤트 (성능 최적화를 위해 throttle 적용)
  window.addEventListener('scroll', throttle(handleScroll, 16)); // 60fps
  
  // 모바일 메뉴 토글
  if (elements.mobileMenuBtn) {
    elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  
  // 네비게이션 링크 클릭 (부드러운 스크롤)
  elements.navLinks.forEach(link => {
    link.addEventListener('click', handleNavLinkClick);
  });
  
  // 연락처 폼 제출
  if (elements.contactForm) {
    elements.contactForm.addEventListener('submit', handleContactFormSubmit);
  }
  
  // 백 투 탑 버튼
  if (elements.backToTopBtn) {
    elements.backToTopBtn.addEventListener('click', scrollToTop);
  }
  
  // 윈도우 리사이즈 이벤트
  window.addEventListener('resize', handleWindowResize);
  
  // CTA 버튼들 클릭 이벤트
  initializeCTAButtons();
}

/**
 * 스크롤 이벤트 핸들러
 * 네비게이션 바 스타일 변경 및 백 투 탑 버튼 표시/숨김을 처리합니다.
 */
function handleScroll() {
  const scrollY = window.scrollY;
  
  // 네비게이션 바 스타일 변경
  if (scrollY > 50 && !appState.isScrolled) {
    appState.isScrolled = true;
    if (elements.nav) {
      elements.nav.classList.add('scrolled');
    }
  } else if (scrollY <= 50 && appState.isScrolled) {
    appState.isScrolled = false;
    if (elements.nav) {
      elements.nav.classList.remove('scrolled');
    }
  }
  
  // 백 투 탑 버튼 표시/숨김
  if (elements.backToTopBtn) {
    if (scrollY > 300) {
      elements.backToTopBtn.classList.add('visible');
    } else {
      elements.backToTopBtn.classList.remove('visible');
    }
  }
  
  // 스크롤 방향 감지 (미래 기능 확장용)
  appState.lastScrollY = scrollY;
}

/**
 * 모바일 메뉴 토글 함수
 */
function toggleMobileMenu() {
  if (!elements.mobileMenu) return;
  
  appState.isMobileMenuOpen = !appState.isMobileMenuOpen;
  
  if (appState.isMobileMenuOpen) {
    elements.mobileMenu.classList.remove('hidden');
    elements.mobileMenuBtn.innerHTML = '<i class="fas fa-times text-primary-dark"></i>';
    elements.mobileMenuBtn.setAttribute('aria-label', '메뉴 닫기');
    
    // 모바일 메뉴가 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden';
  } else {
    elements.mobileMenu.classList.add('hidden');
    elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars text-primary-dark"></i>';
    elements.mobileMenuBtn.setAttribute('aria-label', '메뉴 열기');
    
    // body 스크롤 복원
    document.body.style.overflow = '';
  }
}

/**
 * 네비게이션 링크 클릭 핸들러
 * 부드러운 스크롤과 모바일 메뉴 닫기를 처리합니다.
 */
function handleNavLinkClick(event) {
  const href = event.target.getAttribute('href');
  
  // 내부 링크인 경우에만 부드러운 스크롤 적용
  if (href && href.startsWith('#')) {
    event.preventDefault();
    
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // 네비게이션 바 높이를 고려한 오프셋
      const navHeight = elements.nav ? elements.nav.offsetHeight : 0;
      const targetPosition = targetElement.offsetTop - navHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // 모바일 메뉴가 열려있으면 닫기
      if (appState.isMobileMenuOpen) {
        toggleMobileMenu();
      }
    }
  }
}

/**
 * 연락처 폼 제출 핸들러
 * 폼 유효성 검사 및 제출 처리를 담당합니다.
 */
function handleContactFormSubmit(event) {
  event.preventDefault();
  
  // 로딩 상태로 변경
  const submitButton = elements.contactForm.querySelector('.submit-button');
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>처리 중...';
  submitButton.disabled = true;
  
  // 폼 데이터 수집
  const formData = new FormData(elements.contactForm);
  const contactData = Object.fromEntries(formData.entries());
  
  // 폼 유효성 검사
  const validationResult = validateContactForm(contactData);
  
  if (!validationResult.isValid) {
    showNotification(validationResult.message, 'error');
    resetSubmitButton(submitButton, originalText);
    return;
  }
  
  // 실제 제출 처리 (여기서는 시뮬레이션)
  simulateFormSubmission(contactData)
    .then(response => {
      if (response.success) {
        showNotification('상담 신청이 성공적으로 전송되었습니다. 곧 연락드리겠습니다!', 'success');
        elements.contactForm.reset();
        
        // 성공 후 추가 처리 (예: GA 이벤트 추적)
        trackContactFormSubmission(contactData);
      } else {
        throw new Error('서버 오류가 발생했습니다.');
      }
    })
    .catch(error => {
      console.error('폼 제출 오류:', error);
      showNotification('죄송합니다. 잠시 후 다시 시도해 주세요.', 'error');
    })
    .finally(() => {
      resetSubmitButton(submitButton, originalText);
    });
}

/**
 * 연락처 폼 유효성 검사 함수
 */
function validateContactForm(data) {
  // 필수 필드 검사
  const requiredFields = ['company', 'name', 'email', 'phone'];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      return {
        isValid: false,
        message: `${getFieldDisplayName(field)}은(는) 필수 입력 항목입니다.`
      };
    }
  }
  
  // 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      isValid: false,
      message: '올바른 이메일 주소를 입력해 주세요.'
    };
  }
  
  // 전화번호 형식 검사 (기본적인 숫자 및 하이픈 포함)
  const phoneRegex = /^[0-9-+\s()]+$/;
  if (!phoneRegex.test(data.phone)) {
    return {
      isValid: false,
      message: '올바른 전화번호를 입력해 주세요.'
    };
  }
  
  return { isValid: true };
}

/**
 * 필드 이름을 한국어로 변환하는 함수
 */
function getFieldDisplayName(fieldName) {
  const fieldNames = {
    company: '회사명',
    name: '담당자명',
    email: '이메일',
    phone: '연락처'
  };
  
  return fieldNames[fieldName] || fieldName;
}

/**
 * 폼 제출 시뮬레이션 함수
 * 실제 환경에서는 실제 API 엔드포인트로 데이터를 전송합니다.
 */
function simulateFormSubmission(data) {
  return new Promise((resolve, reject) => {
    // 실제 API 호출 시뮬레이션 (2초 대기)
    setTimeout(() => {
      // 90% 확률로 성공
      if (Math.random() > 0.1) {
        resolve({ success: true, message: '성공적으로 전송되었습니다.' });
      } else {
        reject(new Error('네트워크 오류'));
      }
    }, 2000);
  });
}

/**
 * 제출 버튼 상태 복원 함수
 */
function resetSubmitButton(button, originalText) {
  button.innerHTML = originalText;
  button.disabled = false;
}

/**
 * 알림 메시지 표시 함수
 */
function showNotification(message, type = 'info') {
  // 기존 알림이 있다면 제거
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // 새 알림 생성
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${getNotificationIcon(type)} mr-2"></i>
      <span>${message}</span>
      <button class="notification-close" aria-label="알림 닫기">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // 스타일 적용
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 400px;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    ${getNotificationStyle(type)}
  `;
  
  document.body.appendChild(notification);
  
  // 애니메이션으로 표시
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // 닫기 버튼 이벤트
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    hideNotification(notification);
  });
  
  // 5초 후 자동 닫기
  setTimeout(() => {
    hideNotification(notification);
  }, 5000);
}

/**
 * 알림 유형별 아이콘 반환
 */
function getNotificationIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  return icons[type] || icons.info;
}

/**
 * 알림 유형별 스타일 반환
 */
function getNotificationStyle(type) {
  const styles = {
    success: 'background: #10B981; color: white;',
    error: 'background: #EF4444; color: white;',
    warning: 'background: #F59E0B; color: white;',
    info: 'background: #3B82F6; color: white;'
  };
  
  return styles[type] || styles.info;
}

/**
 * 알림 숨김 함수
 */
function hideNotification(notification) {
  notification.style.transform = 'translateX(100%)';
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

/**
 * 맨 위로 스크롤 함수
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * 윈도우 리사이즈 핸들러
 */
function handleWindowResize() {
  // 데스크톱으로 전환 시 모바일 메뉴 닫기
  if (window.innerWidth >= 768 && appState.isMobileMenuOpen) {
    toggleMobileMenu();
  }
}

/**
 * CTA 버튼들 초기화
 */
function initializeCTAButtons() {
  // 무료 상담 신청 버튼
  const consultationBtns = document.querySelectorAll('.cta-button.primary');
  consultationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 연락처 섹션으로 스크롤
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const navHeight = elements.nav ? elements.nav.offsetHeight : 0;
        const targetPosition = contactSection.offsetTop - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // 폼의 첫 번째 입력 필드에 포커스
        setTimeout(() => {
          const firstInput = contactSection.querySelector('input');
          if (firstInput) {
            firstInput.focus();
          }
        }, 1000);
      }
    });
  });
  
  // 서비스 영상 보기 버튼
  const videoBtns = document.querySelectorAll('.cta-button.secondary');
  videoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      showVideoModal();
    });
  });
}

/**
 * 비디오 모달 표시 함수
 */
function showVideoModal() {
  // 비디오 모달 생성 (실제 환경에서는 실제 비디오 URL 사용)
  const modal = document.createElement('div');
  modal.className = 'video-modal';
  modal.innerHTML = `
    <div class="video-modal-overlay">
      <div class="video-modal-content">
        <button class="video-modal-close" aria-label="비디오 닫기">
          <i class="fas fa-times"></i>
        </button>
        <div class="video-placeholder">
          <i class="fas fa-play-circle"></i>
          <p>서비스 소개 영상</p>
          <p class="text-sm">실제 환경에서는 여기에 비디오가 재생됩니다.</p>
        </div>
      </div>
    </div>
  `;
  
  // 모달 스타일
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  const modalContent = modal.querySelector('.video-modal-content');
  modalContent.style.cssText = `
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    max-width: 800px;
    width: 90%;
    position: relative;
    transform: scale(0.9);
    transition: transform 0.3s ease;
  `;
  
  const closeBtn = modal.querySelector('.video-modal-close');
  closeBtn.style.cssText = `
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
  `;
  
  const placeholder = modal.querySelector('.video-placeholder');
  placeholder.style.cssText = `
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
  `;
  
  placeholder.querySelector('i').style.cssText = `
    font-size: 4rem;
    color: var(--primary-dark);
    margin-bottom: 1rem;
    display: block;
  `;
  
  document.body.appendChild(modal);
  
  // 애니메이션으로 표시
  setTimeout(() => {
    modal.style.opacity = '1';
    modalContent.style.transform = 'scale(1)';
  }, 100);
  
  // 닫기 이벤트
  const closeModal = () => {
    modal.style.opacity = '0';
    modalContent.style.transform = 'scale(0.9)';
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  };
  
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // ESC 키로 닫기
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

/**
 * 스크롤 애니메이션 초기화
 */
function initializeAnimations() {
  // Intersection Observer를 사용한 스크롤 애니메이션
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  // 애니메이션 대상 요소들 관찰
  const animateElements = document.querySelectorAll('.service-card, .feature-item, .case-study, .about-card');
  animateElements.forEach(el => {
    el.classList.add('scroll-animate');
    observer.observe(el);
  });
}

/**
 * 이벤트 추적 함수 (Google Analytics 등)
 */
function trackContactFormSubmission(data) {
  // Google Analytics 4 이벤트 추적 예시
  if (typeof gtag !== 'undefined') {
    gtag('event', 'form_submit', {
      event_category: 'engagement',
      event_label: 'contact_form',
      custom_parameters: {
        industry: data.industry || 'unknown',
        budget: data.budget || 'unknown'
      }
    });
  }
  
  // 콘솔에 추적 정보 출력 (개발 환경)
  console.log('폼 제출 추적:', {
    event: 'contact_form_submission',
    timestamp: new Date().toISOString(),
    company: data.company,
    industry: data.industry
  });
}

/**
 * 성능 최적화를 위한 throttle 함수
 * 이벤트가 너무 자주 발생하는 것을 방지합니다.
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 디바운스 함수 (미래 사용을 위해 준비)
 * 이벤트가 연속으로 발생할 때 마지막 이벤트만 처리합니다.
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 에러 처리 - 전역 에러 핸들러
window.addEventListener('error', function(event) {
  console.error('JavaScript 오류 발생:', event.error);
  
  // 사용자에게는 일반적인 메시지만 표시
  if (event.error && !event.error.name.includes('Script')) {
    showNotification('일시적인 문제가 발생했습니다. 페이지를 새로고침해 주세요.', 'error');
  }
});

// Promise 오류 처리
window.addEventListener('unhandledrejection', function(event) {
  console.error('처리되지 않은 Promise 오류:', event.reason);
  event.preventDefault(); // 브라우저의 기본 오류 처리 방지
});

// 개발 환경에서의 디버깅 도구
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // 개발 환경에서만 사용할 디버깅 함수들
  window.debugAIMarketing = {
    getAppState: () => appState,
    getElements: () => elements,
    showTestNotification: (type) => showNotification('테스트 알림입니다.', type),
    triggerFormSubmit: () => {
      if (elements.contactForm) {
        // 테스트 데이터로 폼 채우기
        const testData = {
          company: '테스트 회사',
          name: '홍길동',
          email: 'test@example.com',
          phone: '010-1234-5678'
        };
        
        Object.keys(testData).forEach(key => {
          const input = elements.contactForm.querySelector(`[name="${key}"]`);
          if (input) {
            input.value = testData[key];
          }
        });
        
        elements.contactForm.dispatchEvent(new Event('submit'));
      }
    }
  };
  
  console.log('🚀 AI 마케팅 디버깅 도구가 활성화되었습니다. window.debugAIMarketing을 사용하세요.');
}
