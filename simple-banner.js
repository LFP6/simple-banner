import 'classlist.js';

(function(){
    const transitionLength = 1200;
    const style = `
        .simple-banner {
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            transform: translateY(-100%);
            font-size: 20px;
            background-color: #94ebfe;
            opacity: 0;
        }

        .simple-banner-hidden-transition {
            transition: opacity ${transitionLength}ms ease 10ms, transform ${transitionLength}ms ease;
        }
        
        .simple-banner-shown {
            opacity: 1;
            transform: translateY(0%);
        }

        .simple-banner-shown-transition {
            transition: opacity ${transitionLength/0.7}ms ease, transform ${transitionLength}ms ease;
        }
        
        .simple-banner-content, .simple-banner-confirm {
            width: auto;
            overflow: hidden;
            text-align: center;
        }

        .simple-banner-confirm {
            display: none;
        }
        
        .simple-banner-close {
            float: right;
            font-weight: bold;
            background: none;
            border: none;
            font-weight: bold;
            height: 100%;
            font-size: 20px;
        }
        
        .simple-banner-close:hover {
            cursor: pointer;
        }

        .simple-banner-confirm button, .simple-banner-confirm select {
            background: white;
            border: 1px solid #AAA;
        }

        .simple-banner-confirm button {
            border-radius: 5px;
            padding: 5px;
        }

        .simple-banner-confirm select {
            padding: 4px;
        }

        .simple-banner-hide-forever {
            margin-left: 30px;
        }
    `;
    let css = document.createElement('style');
    css.type = "text/css";
    css.innerHTML = style;
    document.getElementsByTagName("head")[0].appendChild(css);

    let openBanner = null;

    class SimpleBanner {
        constructor(name, content, {
            container=document.body,
            ariaCloseText='Close banner',
            transitionByDefault=true,
            allowClose=true,
            allowHideAWhile=true,
            allowHideForever=true
        }) {
            this.name = name;
            this.container = container;
            this.transitionByDefault = transitionByDefault;
            this.allowClose = allowClose;
            this.allowHideAWhile = allowHideAWhile;
            this.allowHideForever = allowHideForever;

            this.banner = document.createElement('div');
            this.banner.className = `simple-banner simple-banner-${name}`;
            this.banner.innerHTML = `
                <button class="simple-banner-close" style="${this.allowClose ? '' : 'display: none;'}" aria-label="${ariaCloseText}">&times;</button>
                <div class="simple-banner-content">${content}</div>
                <div class="simple-banner-confirm">
                    <button class="simple-banner-show-later" style="${this.allowHideAWhile ? '' : 'display: none;'}">Show Later</button>
                    <select class="simple-banner-show-when" style="${this.allowHideAWhile ? '' : 'display: none;'}">
                        <option value=0>Next Visit</option>
                        <option value=1>Tomorrow</option>
                        <option value=7>Next Week</option>
                    </select>
                    <button class="simple-banner-hide-forever" style="${this.allowHideForever ? '' : 'display: none;'}">Hide Forever</button>
                </div>
            `;
            this.banner.getElementsByClassName('simple-banner-close')[0].addEventListener('click', () => { this.confirmHide() });
            this.banner.getElementsByClassName('simple-banner-show-later')[0].addEventListener('click', () => { this.hideForNow() });
            this.banner.getElementsByClassName('simple-banner-hide-forever')[0].addEventListener('click', () => { this.hideForever() });
        }
    
        show(transition=this.transitionByDefault) {
            if (openBanner) return 'OPEN_BANNER';
            let cookie = Cookies.get(`simplebanner_${this.name}`);
            if (cookie == 'OFF') return 'COOKIE_SET';

            this.banner.getElementsByClassName('simple-banner-content')[0].style.display = '';
            if (this.allowClose) this.banner.getElementsByClassName('simple-banner-close')[0].style.display = '';
            this.banner.getElementsByClassName('simple-banner-confirm')[0].style.display = '';
            this.banner.classList.remove('simple-banner-hidden-transition');

            this.container.insertBefore(this.banner, this.container.firstChild);
            setTimeout(() => {
                if (transition) this.banner.classList.add('simple-banner-shown-transition');
                this.banner.classList.add('simple-banner-shown');
            }, 100);

            openBanner = this;
        }

        confirmHide() {
            if (this.allowHideAWhile || this.allowHideForever) {
                this.banner.getElementsByClassName('simple-banner-content')[0].style.display = 'none';
                this.banner.getElementsByClassName('simple-banner-close')[0].style.display = 'none';
                this.banner.getElementsByClassName('simple-banner-confirm')[0].style.display = 'block';
            } else this.hide();
        }

        hideForNow() {
            let expires = +this.banner.getElementsByClassName('simple-banner-show-when')[0].value;
            Cookies.set(`simplebanner_${this.name}`, 'OFF', {expires});
            this.hide();
        }

        hideForever() {
            Cookies.set(`simplebanner_${this.name}`, 'OFF');
            this.hide();
        }

        hide(transition=this.transitionByDefault) {
            this.banner.classList.remove('simple-banner-shown-transition');
            if (transition) this.banner.classList.add('simple-banner-hidden-transition');
            this.banner.classList.remove('simple-banner-shown');
            setTimeout(() => {
                this.banner.parentElement.removeChild(this.banner);
            }, transitionLength);
            openBanner = null;
        }

        static hideOpen(transition) {
            if (openBanner) openBanner.hide(transition);
        }
    }

    window.SimpleBanner = SimpleBanner;
})();