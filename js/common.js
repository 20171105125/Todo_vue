;(function(){
  'use strict';

  var Event = new Vue();
  var alert_sound = document.getElementById('alert-sound');

  Vue.component('task',{
    template: '#task-tpl',
    props:['item'],
    methods: {
      action: function(name, params){
        Event.$emit(name, params);
      }
    }
  });

  var vm = new Vue({
    el: '#page',

    data: {
      list: [],
      current: {
        // title: '',
        // completed: false,
        // description: '',
        // remind_at: '2020-10-01'
      },
    },

    mounted: function(){
      let me = this;
      this.list = myStorage.get('list') || [];

      setInterval(function(){
        me.check_alarts();
      }, 1000);

      Event.$on('remove',function(params){
        if(params){
          me.remove(params);
        }
      });
      Event.$on('toggle_completed',function(params){
        if(params){
          me.toggle_completed(params);
        }
      });
      Event.$on('set_current',function(params){
        if(params){
          me.set_current(params);
        }
      });
      Event.$on('toggle_detail',function(params){
        if(params){
          me.toggle_detail(params);
        }
      });
    },

    methods: {
      check_alarts: function(){
        let me = this;
        this.list.forEach(function(row, i){
          let remind_at = row.remind_at;
          if(!remind_at || row.alert_comfirmed){
            return;
          };

          let remind_at_timestamp = (new Date(remind_at)).getTime();
          let now_timestamp = (new Date()).getTime();

          if(remind_at_timestamp <= now_timestamp){
            let confirmed = confirm(row.title);
            // if(confirmed) {
            //   alert_sound.play();
            // } else{
            //   alert_sound.stop();
            // }
            Vue.set(me.list[i], 'alert_comfirmed', confirmed);
          }
        });
      },

      next_id: function(){                      //使id实现自增
        var idStr = Date.now().toString(36)
        idStr += Math.random().toString(36).substr(3)
        return idStr;
      },

      find_index_by_id: function(id){
        return this.list.findIndex(function(item){
          return item.id == id;                   //找到为id为当前所选的项并赋值给index
        });
      },

      merge: function(){                        //add方法和update方法合并
        let current = this.current;
        let title = this.current.title;
        let description = this.current.description;
        let is_update, id;
        is_update = id = current.id;

        if(is_update){                          //判断是否为更新操作
          let index = this.find_index_by_id(id);
          Vue.set(this.list, index, Object.assign({}, current));
        } else {
          if(!title && title !== 0){            //不允许标题为空
            return;
          };
          let item = Object.assign({}, current)  //复制目标对象赋值给目的对象
          item.id = this.next_id();              //复制目标id给目的id
          this.list.push(item);
        }
        this.reset_current();
      },

      remove: function(id){                    //使用索引进行定位进行删除的方法
        let index = this.find_index_by_id(id);
        this.list.splice(index, 1);
      },

      set_current: function(item){                //将操作目标(更改指针)定位到所选项目
        this.current = Object.assign({}, item);
      },

      reset_current: function(){                  //重设（清空）操作目标
        this.set_current({});
      },

      toggle_completed: function(id){
        let index = this.find_index_by_id(id);
        Vue.set(this.list[index], 'completed', !this.list[index].completed);
      },

      toggle_detail: function(id){
        let index = this.find_index_by_id(id);
        Vue.set(this.list[index], 'show_detail', !this.list[index].show_detail);
      },

    },

    watch: {
      list: {
        deep: true,
        handler: function(new_val, old_val){
          if(new_val){
            myStorage.set('list',new_val);
          } else {
            myStorage.set('list',[]);
          }
        }
      },

    }
  });





  })();
