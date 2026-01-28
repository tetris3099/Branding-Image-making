window.addEventListener('DOMContentLoaded', () => {
  // Elements html
  const modalWin = document.querySelector('div[modal-popup]');
  const blackBoxNavigation = document.querySelector('div[data-navigation]');
  const mobileMenuButton = document.querySelector('button[mobile-menu-open]');
  const feedbackForm = document.forms.feedback;
  const elementsForm = feedbackForm.querySelectorAll('.feedback__field');
  //

  // object mobile menu functions
  const mobileMenuFns = {
    isOpen() {
      if (blackBoxNavigation.classList.contains('active')) {
        mobileMenuButton.setAttribute('mobile-menu-open', 'true');
        return;
      }

      mobileMenuButton.setAttribute('mobile-menu-open', 'false');
    },
    closesMenu() {
      const statusMenu = mobileMenuButton.getAttribute('mobile-menu-open');
      if (statusMenu === 'true') {
        mobileMenuOpen.start();
      }
    },
  };
  //

  const scrollPage = ({ button = null, attribute = null }) => {
    if (!button && !attribute) {
      console.warn('scrollPageFn: missing button and attribute');
      return;
    }
    mobileMenuFns.closesMenu();
    const scrollTarget = button ? button.dataset.scroll : attribute;
    const box = document.querySelector(`section[${scrollTarget}]`);
    if (!box) return;
    const coordinates = box.getBoundingClientRect().top + pageYOffset;
    window.scrollTo(0, coordinates);
  };

  class ToggClass {
    constructor({ element = null, className = null, autoStart = false, callback = null }) {
      this.element = element; //variable or variable array
      this.className = className; //string or string array
      this.callback = callback;
      if (autoStart) {
        this.start();
      }
    }

    start() {
      if (!this.element || !this.className) {
        console.warn(`ToggClass: No variable or class name specified`);
        return;
      }
      // is array
      if (Array.isArray(this.element) && Array.isArray(this.className)) {
        this.element.forEach((el, i) => {
          el.classList.toggle(this.className[i]);
        });

        if (this.callback) {
          this.callback();
        }
        return;
      }
      // is not array
      this.element.classList.toggle(this.className);

      if (this.callback) {
        this.callback();
      }
    }
  }

  // scrolling from the about page
  const scrollWork = localStorage.getItem('scrollWork');
  if (scrollWork) {
    scrollPage({ attribute: scrollWork });
    localStorage.removeItem('scrollWork');
  }
  //

  // Contacts
  const contactOpen = new ToggClass({
    element: [document.body, modalWin],
    className: ['open', 'is-hidden'],
    callback: mobileMenuFns.closesMenu,
  });

  // Mobile menu
  const mobileMenuOpen = new ToggClass({
    element: [document.body, blackBoxNavigation],
    className: ['open', 'active'],
    callback: mobileMenuFns.isOpen,
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    const buttonWorks = target.hasAttribute('data-scroll');
    const buttonContact = target.hasAttribute('data-contact') || target.closest('.close-contacts');
    const mobileMenu =
      target.hasAttribute('mobile-menu-open') ||
      target.closest('.topbar__mobile-menu') ||
      target.closest('.close-mobile-menu');

    if (buttonWorks) {
      // scrolling for section "works"
      if (document.body.hasAttribute('page-about')) {
        // scrolling from the about page
        localStorage.setItem('scrollWork', `${target.dataset.scroll}`);
        window.location.assign('/index.html');
      }
      scrollPage({ button: target });
    }

    if (buttonContact || target === modalWin) {
      // contacts open clese
      contactOpen.start();
    }

    if (mobileMenu || target === blackBoxNavigation) {
      // mobile menu open close
      mobileMenuOpen.start();
    }
  });

  // Form input events
  const feedbackEventsInput = (arr) => {
    let savePlaceholder = {};
    arr.forEach((element) => {
      element.addEventListener('focus', () => {
        const nameKey = element.name;
        savePlaceholder[nameKey] = element.placeholder;
        element.placeholder = '';
      });

      element.addEventListener('blur', () => {
        const nameKey = element.name;
        element.placeholder = savePlaceholder[nameKey];
      });
    });
  };

  feedbackEventsInput(elementsForm);
  //

  feedbackForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const fields = this.querySelectorAll('.feedback__field');
    let errorQuantity = 0;
    formsAnim({
      form: this,
    });

    for (let i = 0; i < fields.length - 1; i += 1) {
      const value = fields[i].value;
      if (!value) {
        errorQuantity += 1;
        alert(`Fill in the field ${fields[i].name}`);
        formsAnim({
          form: this,
          change: 'stop',
        });
        return;
      }
    }

    const actionForm = this.action;
    const formData = new FormData(this);
    fetch(actionForm, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (res.ok) {
          formsAnim({
            form: this,
            change: 'ok',
          });
          feedbackForm.reset();
        }

        const header = res.headers.get('Content-Type');
        if (header === 'application/json') {
          return res.json();
        }

        return res.text();
      })
      .then((data) => console.log(data))
      .catch((err) => {
        console.log(err);
        formsAnim({
          form: this,
          change: 'error',
        });
      });
  });

  function formsAnim({ form = null, change = null }) {
    // form - variable or context this; change: string(ok, stop, error, active default);
    if (!form) {
      console.warn('formAnim: No form variable specified');
      return;
    }
    const animationBox = form.querySelector('div[data-animation]'); // form->div[data-animation]
    const offTimer = (removeClass) => {
      // removeClass: sting remove class;
      setTimeout(() => {
        animationBox.classList.remove('active');
        animationBox.classList.remove(removeClass);
      }, 1800);
    };

    if (change === 'stop') {
      animationBox.classList.remove('active');
      return;
    }

    if (change === 'ok') {
      animationBox.classList.add('ok');
      offTimer('ok');
      return;
    }

    if (change === 'error') {
      animationBox.classList.add('err');
      offTimer('err');
      return;
    }

    animationBox.classList.add('active');
  }
});
