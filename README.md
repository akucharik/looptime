# Looptime

Looptime is a timer for JavaScript games, animations, or anything with a render loop.

# Usage

Download the minified library and include it in your html.

```html
<script src="scripts/looptime.min.js"></script>
```

Create a timer manager and add a timer.
Then within your render loop update the timer manager with the change in time.

```javascript
let count = 0;

function increment () {
    count++;
}

const timers = new Looptime.TimerManager();

timers.addTimer(1000, {
    delay: 200,
    repeat: 2,
    onRepeat: increment,
    onComplete: increment
});

// Example of a PIXI application render loop
function animate(deltaTime) {
    timers.update(deltaTime * ticker.elapsedMS);
    app.renderer.render(app.stage);
}
```

# Documentation

## Looptime.TimerManager
### TimerManager()
Creates a TimerManager instance.

```javascript
var timers = new Looptime.TimerManager();
```

## Methods
### add()
Adds a timer to the manager.

```javascript
timers.add();
```

### remove()
Removes a timer from the manager.

```javascript
timers.remove();
```

### removeAll()
Removes all timers from the manager.

```javascript
timers.removeAll();
```

### update()
Updates all timers handled by the manager.

```javascript
timers.update();
```

## Looptime.Timer
### Timer()
Creates a Timer instance.

```javascript
var timer = new Looptime.Timer();
```

## Methods
### update()
Updates the timer.

```javascript
timer.update();
```

### restart()
Restarts the timer.

```javascript
timer.restart();
```