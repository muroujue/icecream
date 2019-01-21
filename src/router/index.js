import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Game from '@/pages/Game'
import GamePad from '@/pages/GamePad'
import Poster from '@/pages/Poster'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '',
      redirect: '/game'
    },
    // {
    //   path: '/home',
    //   name: 'home',
    //   component: Home
    // },
    {
      path: '/game',
      name: 'game',
      component: Game
    },
    {
      path: '/gamepad',
      name: 'gamepad',
      component: GamePad
    },
    {
      path: '/poster',
      name: 'poster',
      component: Poster
    }
  ]
})
