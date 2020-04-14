document
  .querySelector('.page-header__toggle')
  .addEventListener('click', evt => {
    evt.preventDefault();

    document
      .querySelector('.page-header__nav')
      .classList.toggle('page-header__nav--closed');

    document
      .querySelector('.page-header__nav')
      .classList.toggle('page-header__nav--opened');
  });
