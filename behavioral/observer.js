// taken from https://itnext.io/the-observer-pattern-in-nodejs-c0cfffb4744a

const EventEmitter = require('events').EventEmitter;

class Pizza extends EventEmitter {
  constructor(size = 1) {
    super();
    this.ovenTime = this._ovenTime(size);
    this.maxIngredients = this._maxIngredients(size);
    this.ingredients = [];
    this.timeToReleasePizza = 5;
  }

  /**
   * Static function returns the size types
   */
  static sizes() {
    return {
      individual: 1,
      medium: 2,
      familiar: 3,
    };
  }

  /**
   * Max pizza ingredients by size
   * @param {Number} size
   * @returns {Number}
   */
  _maxIngredients(size) {
    return size * 3;
  }

  /**
   * Oven time by size
   * @param {Number} size
   * @returns {Number}
   */
  _ovenTime(size) {
    return 5 + size * 2;
  }

  /**
   * Checks if max number of ingredients was reached
   * @returns {Boolean}
   */
  _isMaxIngredientsReached() {
    return this.ingredients.length === this.maxIngredients;
  }

  add(ingredient) {
    if (!this._isMaxIngredientsReached()) {
      this.ingredients.push(ingredient);
      this.emit('ingredientAdded', ingredient);
    } else {
      this.emit('maxIngredientsReached');
    }
    return this;
  }

  remove(ingredient) {
    const ingredientToRemove = this.ingredients.indexOf(ingredient);
    if (ingredientToRemove !== -1) {
      this.ingredients.splice(ingredientToRemove, 1);
      this.emit('ingredientRemoved', ingredient);
    } else {
      this.emit('errorRemovingIngredient', ingredient);
    }
    return this;
  }

  /**
   * It starts the timer once the oven time is passed,
   * the pizza has to be released (clearing the interval)
   * in a specific amount of time to avoid charring
   * @returns {Pizza}
   */
  cook() {
    this.emit('cookStarted');
    setTimeout(() => {
      const releasePizza = setTimeout(() => {
        this.emit('charredPizza');
      }, this.timeToReleasePizza);
      this.emit('cookFinished', releasePizza);
    }, this.ovenTime);

    return this;
  }
}

// test

const createMediumPizza = () => {
  const pizza = new Pizza(Pizza.sizes().medium);
  pizza
    .on('ingredientAdded', (ing) => console.log(`${ing} added`))
    .on('maxIngredientsReached', (ing) =>
      console.log(`Max ingredients (${pizza.maxIngredients}) reached`)
    )
    .on('ingredientRemoved', (ing) => console.log(`${ing} removed`))
    .on('errorRemovingIngredient', (ing) =>
      console.log(`Cannot remove ${ing} because it is not on the pizza`)
    )
    .on('cookStarted', () => console.log(`Pizza is in the oven.`))
    .on('cookFinished', (release) => {
      console.log(`Pizza is ready to release.`);
      clearTimeout(release);
      console.info('Pizza was released!');
    })
    .add('Tomato')
    .add('Mushrooms')
    .add('Scarmoza')
    .add('Bone')
    .remove('Bone')
    .add('Pepper')
    .remove('Peper')
    .add('Onion')
    .add('Pepperoni')
    .add('Oregano')
    .cook();
};

createMediumPizza();
