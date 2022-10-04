;(function() {
	'use strict';

	class Gallery {
		// настройки по-умолчанию
		static defaults = {
			margin:			10,		// расстояние между элементами [px]
			visibleItems: 	1,		// сколько элементов показывать одновременно
			border:			0,		// толщина рамки изображения прописанная в CSS [px]
			responsive:		true,	// адаптивная галерея
			autoScroll:		false,	// автоматическое прокручивание
			interval: 		3000,	// задержка при автоматическом прокручивании [ms]
			nav:			true,	// показать/скрыть кнопки next/prev
			dots:			false,	// показать/скрыть постраничную навигацию
			keyControl: 	false,	// управление клавишами вправо / влево
			animated:		false,	// включение анимации
			baseTransition:	0.4,	// скорость анимации, при изменении CSS свойств
			delayTimer:		250,	// время задержки при resize страницы [ms]
			limit:			30		// ограничиваем перемещение крайних элементов [px]
		};
		static LEFT = 37;	// код клавиши 'стрелочка влево' 
		static RIGHT = 39;	// код клавиши 'стрелочка вправо'

		constructor(gallery, setup) {
			this.gallery = gallery;
			this.setup = setup;

			// контейнер в котором отображаются элементы галереи
			this.slider = this.gallery.querySelector('.slider');
			// контейнер, непосредственно в котором расположены элементы слайдера
			this.stage = this.gallery.querySelector('.stage');
			// элементы слайдера
			this.items = this.gallery.querySelectorAll('.stage > div');
			// количество элементов в слайдере
			this.count = this.items.length;

			this.current = 0;		// index координаты текущего элемента
			this.next = 0;			// index координаты следующего элемента
			this.pressed = false;	// указывает, что совершилось событие 'mousedown'
			this.start = 0;			// координата, с которой начато перетаскивание
			this.shift = 0;			// на сколько был перемещён курсор относительно start

			// построение галереи исходя из полученных настроек
			this.init();
		}

		// объединяет и перезаписывает значения двух объектов
		// и выдаёт общий результат
		static extend(out) {
			out = out || {};
			for (let i = 1; i < arguments.length; i++) {
				if (!arguments[i]) continue;
				for (let key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key)) out[key] = arguments[i][key];
				}
			}
			return out;
		};

		// возвращает координату Х текущего положения
		// курсора или пальца
		static xpos(e) {
			// touch event
			// проверяем, сформирован ли список точек на текущем элементе
			// (список пальцев, которые вступили в контакт)
			if (e.targetTouches && (e.targetTouches.length >= 1)) {
				// положение первой точки прикосновения, относительно левого края браузера
				return e.targetTouches[0].clientX;
			}
			// mouse event
			return e.clientX;
		}

		init() {
			// объединяем дефолтные настройки с настройками галереи
			this.options = Gallery.extend({}, Gallery.defaults, this.setup);
			// формируем каркас галереи
			this.setSizeCarousel();
			// заполняем массив с координатами X каждого элемента слайдера
			this.setCoordinates();
			// формируем управление слайдером в зависимости от настроек
			this.initControl();
			// устанавливаем обработчики событий, если ещё не устанавливались
			if (this.events) return;
			this.registerEventsHandler();
		}

		setSizeCarousel() {
			// получаем ширину слайдера - вьюпорт, в котором прокручиваются элементы галереи
			this.widthSlider = this.slider.offsetWidth;

			// если разрешена адаптация галереи, то необходимо, используя свойство
			// 'options.adaptive', получить значения разрешений (контрольные точки),
			// при которых будут меняться количество видимых элементов галереи и
			// и другие её настройки
			if (this.options.responsive) this.setAdaptiveOptions();

			// максимальный индекс, который может быть у текущего элемента
			// чтобы на последней странице галереи при использовании пагинатора
			// наблюдалось кол-во элементов равное options.visibleItems
			this.max = this.count - this.options.visibleItems;

			// получаем ширину элемента слайдера, которая зависит от колличества
			// одновременно видимых элементов, размера отступа между элементами и
			// общей ширины слайдера
			// от ширины слайдера вычитаем сумму отступов
			// уменьшенную на 1, т.к. отступ последнего видимого элемента не попадает
			// в окно слайдера (контейнер '.stage')
			const width = (this.widthSlider - this.options.margin * (this.options.visibleItems - 1)) / this.options.visibleItems;

			// значение, по которому отсчитываются координаты
			// состоит из ширины элемента слайдера и его margin-right
			// другими словами - растоянием между левыми границами элементов слайдера
			this.width = width + this.options.margin;
			// ширина контейнера '.stage', непосредственно в котором
			// расположены элементы слайдера
			this.widths = this.width * this.count;
			// задаётся стиль ширины контейнера '.stage'
			this.stage.style.width = this.widths + 'px';
			// перебираем коллекцию элементов слайдера и
			// прописываем ширину и правый отступ для каждого элемента
			for (let item of this.items) {
				item.style.cssText = `width:${width}px; margin-right:${this.options.margin}px;`;
			}

			// после того, как каркас галереи построен, все размеры элементов
			// вычислены и прописаны в стилях, делаем карусель видимой через
			// свойство стиля 'visibility'
			setTimeout(() => { this.gallery.style.visibility = 'visible' }, 350);
		}

		setCoordinates() {
			// координата первого элемента, от неё и будет идти отсчёт
			let point = 0;
			// добавляем новое свойство в объект 'options'
			// пока это пустой массив
			this.coordinates = [];

			// заполняем в цикле массив пока количество его элементов
			// не станет равно количеству элементов слайдера,
			// т.е. будет записана координата X каждого элемента
			while (this.coordinates.length < this.count) {
				// добавляем в конец массива текущее значение переменной 'point'
				// которое равно координате X текущего элемента слайдера
				this.coordinates.push(point);
				// вычитаем из текущей координаты ширину блока, равную
				// сумме ширины элемента слайдера и отступа или другими
				// словами - расстояние между левыми границами элементов
				point -= this.width;
			}
		}

		initControl() {
			// объект с кнопками навигации 'prev / next'
			this.navCtrl = this.gallery.querySelector('.nav-ctrl');
			// объект перелистывания галереи с помощью пагинации
			this.dotsCtrl = this.gallery.querySelector('.dots-ctrl');

			if (this.options.nav === true) {
				// кнопка 'prev'
				this.btnPrev = this.navCtrl.querySelector('[data-shift=prev]');
				// кнопка 'next'
				this.btnNext = this.navCtrl.querySelector('[data-shift=next]');
				// устанавливаем стили для кнопок 'prev' и 'next'
				this.setNavStyle();
				// делаем навигацию видимой
				this.navCtrl.dataset.hidden = false;
			} else {
				// делаем навигацию невидимой
				this.navCtrl.dataset.hidden = true;
			}

			if (this.options.dots === true) {
				// формируем постраничную навигацию
				this.creatDotsCtrl();
				// делаем постраничную навигацию видимой
				this.dotsCtrl.dataset.hidden = false;
			} else {
				// делаем постраничную навигацию невидимой
				this.dotsCtrl.dataset.hidden = true;
			}
		}

		setAdaptiveOptions() {
			// размер видимой части окна браузера
			const width = document.documentElement.clientWidth;
			// массив с контрольными точками
			const points = [];
			// текущая контрольная точка
			let point;

			// получаем массив из контрольных точек (break point)
			for (let key in this.options.adaptive) {
				points.push(key);
			}

			// сравнивая ширину страницы (документа) со значениями break point из массива,
			// определяем ближайшую контрольную точку 'снизу'. Эта точка будет служить
			// ключом к объекту с настройками для данного диапазона ширины страницы
			for (let i = 0, j = points.length; i < j; i++) {
				let a = points[i],
					b = (points[i + 1] !== undefined) ? points[i + 1] : points[i];

				if (width <= points[0]) {
					point = points[0];
				} else if (width >= a && width < b) {
					point = a;
				} else if (width >= points[points.length - 1]) {
					point = points[points.length - 1];
				}
			}

			// записываем полученные из object[point] настройки в options
			// данные настройки будут записаны поверх существующих
			const setting = this.options.adaptive[point];
			for (let key in setting) {
				this.options[key] = setting[key];
			}
		}

		setNavStyle() {
			// убираем у всех кнопок класс 'disable', теперь
			// обе кнопки выглядят активными
			this.btnPrev.classList.remove('disable');
			this.btnNext.classList.remove('disable');

			if (this.current == 0) {
				// если первый элемент является текущим, то блокируем попытку просмотра
				// предыдущего элемента, т.к. его не существует и делаем кнопку
				// 'prev' неактивной
				this.btnPrev.classList.add('disable');
			} else if (this.current >= this.count - this.options.visibleItems) {
				// если последний элемент появился на экране, при этом не важен
				// его индекс, блокируем и делаем неактивной кнопку просмотра след.
				// элемента на экране будет наблюдаться столько элементов,
				// сколько указано в visibleItems
				this.btnNext.classList.add('disable');
			}
		}

		creatDotsCtrl() {
			// массив с элементы управления постраничной навигацией
			this.spots = [];
			// при ресайзе страницы удаляем элементы постраничной навигации, т.к
			// она будет перестроена исходя из новых настроек, актуальных для текущего
			// разрешения (ширины экрана)
			this.dotsCtrl.innerHTML = '';

			// создаём элемент списка, внутри которых будут находится
			// элементы, управляющие постраничной навигацией
			const li = document.createElement('li');
			// создаём элемент span, который будет отображать точку
			// const span = document.createElement('span');
			let i = 0, point = 0, clone;

			// добавляем созданный элемент 'span' в элемент списка 'li'
			// li.appendChild(span);
			while (i < this.count) {
				// создаём клон полученного элемента списка
				clone = li.cloneNode(true);
				// добавляем клон (элемент 'li') в конец объекта 'dotsCtrl'
				this.dotsCtrl.appendChild(clone);
				// и в массив
				this.spots.push(clone);

				// увеличиваем i на количество видимых элементов галереи
				i += this.options.visibleItems;
				// рассчитываем следующую координату Х, к которой необходимо прокрутить
				// слайдер при постраничной навигации
				point = (i <= this.max) ? point - this.width * this.options.visibleItems : -this.width * this.max;
			}
			this.setDotsStyle();
		}

		setDotsStyle() {
			// перебираем массив и делаем все элементы массива неактивными
			for (let spot of this.spots) {
				spot.classList.remove('active');
			}
			// находим индекс элемента, который необходимо сделать активным
			// метод Math.trunc() возвращает целую часть числа путём удаления всех дробных знаков.
			const i = (this.next < this.max) ? Math.trunc(this.next / this.options.visibleItems) : this.spots.length - 1;
			// добавляем класс элементу с найденным индексом
			this.spots[i].classList.add('active');
		}

		///////////////////////////////////////////////////

		/* регистрация обработчиков событий */

		registerEventsHandler(e) {
			// регистрируем обработчик изменения размеров окна браузера
			window.addEventListener('resize', this.resize.bind(this));
			// автоматическое прокручивание, запускается установкой в настройках
			// значения свойства 'autoScroll' в true
			// т.к. мы делаем слайдер, а не карусель использовать автоскролл лучше
			// при выводе только одного изображения
			if (this.options.autoScroll) {
				setInterval(() => this.autoScroll(), this.options.interval);
			}
			// управление кликом по кнопкам 'prev / next' объекта 'navCtrl'
			this.navCtrl.addEventListener('click', this.navControl.bind(this));
			// управление постраничной навигацией точками
			this.dotsCtrl.addEventListener('click', this.dotsControl.bind(this));
			// управление клавишами вправо / влево
			// будет корректно работать, если на странице только одна галерея, 
			// по умолчанию управление отключено
			if (this.options.keyControl) {
				window.addEventListener('keydown', this.keyControl.bind(this));
			}
			// просмотр полноразмерной фотографии
			this.gallery.querySelector('.slider').addEventListener('click', this.showPhoto.bind(this));

			// mouse events
			// управление колёсиком мыши, управление работает, если указатель
			// мыши находится над DIV'ом с классом 'slider'
			this.gallery.querySelector('.slider').addEventListener('wheel', this.wheelControl.bind(this));

			// нажатие кнопки мыши на слайдер
			this.stage.addEventListener('mousedown', this.tap.bind(this));
			// прокрутка слайдера перемещением мыши 
			this.stage.addEventListener('mousemove', this.drag.bind(this));
			// отпускание кнопки мыши
			this.stage.addEventListener('mouseup', this.release.bind(this));
			// курсор мыши выходит за пределы DIV'а с классом 'slider'
			this.stage.addEventListener('mouseout', this.release.bind(this));

			// touch events
			// касание экрана пальцем
			this.stage.addEventListener('touchstart', this.tap.bind(this));
			// перемещение пальца по экрану (swipe)
			this.stage.addEventListener('touchmove', this.drag.bind(this));
			// палец отрывается от экрана
			this.stage.addEventListener('touchend', this.release.bind(this));

			// флаг, информирующий о том, что обработчики событий установлены
			this.events = true;
		}

		resize() {
			// обнуляем таймер
			clearTimeout(this.resizeTimer);
			// чтобы уменьшить нагрузку, обработку изменившихся параметров производим
			// через заданный период времени, используя таймер-планировщик
			this.resizeTimer = setTimeout(() => {
				// инициализируем галерею с учётом нового разрешения экрана
				this.init();
				// получаем новый индекс текущего элемента
				this.current = (this.current <= this.max) ? this.current : this.max;
				// после изменения каркаса слайдера под новое разрешение,
				// находим новую координату текущего элемента
				let x = this.coordinates[this.current];
				// прокручиваем слайдер до элемента, который до начала ресайзинга
				// был текущим
				this.scroll(x, this.options.baseTransition);
			}, this.options.delayTimer);
		}

		// автоматическое прокручивание галереи
		autoScroll(e) {
			// получаем координату Х элемента, до которого должен переместиться слайдер
			// галерея всегда прокручивается вправо, поэтому аргумент, через который
			// передаётся direction, всегда равен 1
			const x = this.getNextCoordinates(1);
			// запускаем прокручивание галереи
			this.scroll(x, this.options.baseTransition);
		}

		// управление галерей кнопками 'prev / next'
		navControl(e) {
			// если клик был сделан не по элементу 'span' объекта
			// navCtrl, прекращаем работу функции
			if (e.target.tagName != 'SPAN') return;
			// определяем направление прокручивания галереи
			// зависит от кнопки, по которой был сделан клик
			// -1 - prev, 1 - next
			const d = (e.target.dataset.shift === 'next') ? 1 : -1;
			// получаем координату Х элемента, до которого должен переместиться слайдер
			const x = this.getNextCoordinates(d);
			// запускаем прокручивание галереи
			this.scroll(x, this.options.baseTransition);
		}

		// пролистываем галерею на колличество видимых элементов
		// с помощью постраничной навигации
		dotsControl(e) {
			// если клик был сделан не по элементу 'span' объекта dotsCtrl или
			// по активному элементу, соответствующему текущей странице,
			// прекращаем работу функции
			if (e.target.tagName != 'LI' || e.target.classList.contains('active')) return;

			// находим индекс элемента 'span' в массиве 'spots'
			// этот индекс понадобится для поиска координаты
			// в массиве 'coordinates'
			const i = this.spots.indexOf(e.target);
			// если элемент в массиве 'spots' не найден, прекращаем работу функции
			if (i == -1) return;

			// получаем индекс координаты, до которой будет прокручиваться галерея
			this.next = i * this.options.visibleItems;
			// ограничиваем индекс координаты, чтобы при переходе на последнюю страницу,
			// она была полностью заполнена, т.е. на последней странице должно быть
			// всегда visibleItems элементов
			this.next = (this.next <= this.max) ? this.next : this.max;
			// координата, до которой будет происходить scroll
			const x = this.coordinates[this.next];
			// вычисляем, на сколько элементов будет прокручена галерея
			const n = Math.abs(this.current - this.next);
			// увеличиваем время анимации скролла в зависимости от количества
			// прокручиваемых элементов
			const t = this.options.baseTransition + n * 0.07;

			// запускаем прокручивание галереи
			this.scroll(x, t);
		}

		// листаем галерею с помощью клавиатуры
		keyControl(e) {
			// проверяем код нажатой клавиши и исходя из полученного
			// кода определяем направление прокручивания галереи
			// если код не соотвествует клавишам 'влево' или 'вправо',
			// прекращаем работу функции
			if (e.which !== Gallery.RIGHT && e.which !== Gallery.LEFT) return;
			const d = (e.which === Gallery.RIGHT) ? 1 : -1;
			// получаем координату Х элемента, до которого должна переместиться галерея
			const x = this.getNextCoordinates(d);
			// запускаем прокручивание галереи
			this.scroll(x, this.options.baseTransition);
		}

		// листаем галерею вращая колёсико мыши
		wheelControl(e) {
			// отключаем поведение по умолчанию - скролл страницы
			e.preventDefault();
			// определяем направление перемещения в зависимости от направления
			// вращения колёсика мыши
			const d = (e.deltaY > 0) ? 1 : -1;
			// получаем координату Х элемента, до которого должен переместиться слайдер
			const x = this.getNextCoordinates(d);
			// запускаем прокручивание галереи
			this.scroll(x, this.options.baseTransition);
		}

		// обработчик нажатия левой кнопки мыши на слайдер или
		// касание (тап) пальцем
		tap(e) {
			// отключаем действия по умолчанию
			e.preventDefault();
			e.stopPropagation();
			// если нажата не левая кнопка мыши, прекращаем работу функции
			if (event.which && event.which != 1) return;
			// расстояние от левой границы экрана до курсора без учета прокрутки,
			// т. е. начальная координата Х, с которой начато перетаскивание
			this.start = Gallery.xpos(e);
			// устанавливаем флаг нажатия
			this.pressed = true;
		}

		// прокрутка слайдера перемещением мыши или перемещение пальца по экрану (swipe) 
		drag(e) {
			// отключаем действия по умолчанию
			e.preventDefault();
			e.stopPropagation();

			// если не нажата левая кнопка мыши, прекращаем работу функции
			if (this.pressed === false) return;

			// смещение курсора мыши или пальца от начальной позиции
			this.shift = this.start - Gallery.xpos(e);
			// исключаем дрожание курсора или пальца
			if (Math.abs(this.shift) < 3) return;

			// общая ширина всех невидимых в данный момент элементов слайдера
			const remaining = this.widths - this.width * this.options.visibleItems;
			// разница между текущей координатой и смещением курсора от
			// точки старта, с которой начато перетаскивание
			const delta = this.coordinates[this.current] - this.shift;
			// останавливаем прокручивание галереи при достижении первого или последнего элемента
			if (delta > this.options.limit || Math.abs(delta) - remaining > this.options.limit) return;

			// перемещаем слайдер на величину смещения курсора относительно
			// точки старта (начальной координаты Х)
			this.scroll(delta, 0);
		}

		// отпускание кнопки мыши или палец отрывается от экрана
		// курсор мыши выходит за пределы DIV'а с классом 'slider'
		release(e) {
			// отключаем действия по умолчанию
			e.preventDefault();
			e.stopPropagation();

			// если не было нажатия на кнопку мыши или тапа пальцем,
			// прекращаем работу функции
			if (this.pressed === false) return;

			// рассчитываем направление прокрутки галереи
			const d = (Math.abs(this.shift) > this.width / 2) ? Math.round(this.shift / this.width) : '';
			// определяем координату X ближайшего элемента
			const x = this.getNextCoordinates(d);

			// запускаем доводку прокручивания галереи к ближайшему элементу
			this.scroll(x, this.options.baseTransition);
			// сбрасываем флаг
			this.pressed = false;
		}

		// просмотр полноразмерной фотографии
		showPhoto(e) {
			let target = e.target;
			if (target.tagName != 'IMG') return;
		}

		///////////////////////////////////////////////////

		/* Прокручивание галереи */

		getNextCoordinates(direction) {
			if (typeof(direction) !== 'number') return this.coordinates[this.current];

			// direction - направление перемещения: -1 - left, 1 - right
			if (this.options.autoScroll && this.current >= this.count - this.options.visibleItems) {
				this.next = 0;
			} else {
				// попытка прокрутить к предыдущему элементу, когда текущим является первый элемент
				if (this.current == 0 && direction == -1 || 
					// попытка просмотреть следующую группу элементов при постраничной навигации, но
					// все элементы после текущего выведены во вьюпорт слайдера
					(this.current >= this.max) && direction == 1) return;
				// получаем индекс следующего элемента
				this.next += direction;
			}
			// возвращаем координату след. элемента - координату, до которой
			// необходимо продвинуть галерею
			return this.coordinates[this.next];
		}

		scroll(x, transition) {
			// если аргумент х не является числом, прекращаем работу функции
			if (typeof(x) !== 'number') return;

			// прописываем новые стили для смещения (прокручивания) галереи
			// к следующему элементу
			this.stage.style.cssText = `width:${this.widths}px; height:${this.items[0].offsetHeight}px; transform:translateX(${x}px); transition:${transition}s`;
			// после прокручивания, индекс след. элемента становится текущим
			this.current = (this.next < this.max) ? this.next : this.max;

			// меняем стили отображения кнопок управления в зависимости от
			// текущего индекса
			if (this.options.nav) this.setNavStyle();
			// меняем стили элементов постраничной навигации
			if (this.options.dots) this.setDotsStyle();
		}
	}

	/* Создаём экземпляры галерей */

	// выбираем все галереи на странице
	const galleries = document.querySelectorAll('.gallery');
	// перебираем полученную коллекцию элементов
	for (let gallery of galleries) {
		// вариант настроект для данной галереи
		const setup = gallery.dataset.setting;
		// создаём экземпляр галереи
		const slider = new Gallery(gallery, setting[setup]);
	}
})();
