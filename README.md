# Svg Shcema Editor

Редактор схем сделанный на react svg + redux.
Версия переделанная на Immutable.js

Концепция обработки событий изменилась.
Теперь компоненты не обрабатывают события превращая их в высокоуровневые action.
Все события mouseDown, mouseUp, mouseMove пробрасываются в action как есть.
Вся математика по вычислению положения, выделения элементов делается в action.
Компоненты только отрисовываются.

info to commit: 
git commit -am "еще поправил readme"
git push -u origin master

