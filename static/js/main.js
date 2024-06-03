const store = new Vuex.Store({
    state: {
      search_query:'',
      poster_details:{'poster_id':null,'current_page':'venue'},
      filter_ids:[],
      booking_data:[],
      booking_visible_ids:[],
      auth_token:localStorage.getItem('authToken'),
    },
    mutations: {
        change_query(state,value){
            state.search_query=value;
        },     
        set_poster_details(state,data){
            state.poster_details= data;
        },
        set_filter_ids(state,value){
            state.filter_ids = value;
        },
        set_booking_data(state,value){
            state.booking_data = value;
        },
        set_booking_visible_ids(state,value){
            state.booking_visible_ids = value;
        },

    },
    actions: {     
        async filter_ids_fetch(context,value){
                try {
                        if(value.current_page=='movie'){
                            var response = await fetch(`/api/show/venue/${value.poster_id}?token=${context.state.auth_token}`);
                            try{
                                nl = await response.json();
                                ml = nl.map(item => item.movie_id);

                            } catch(error){
                                console.error('Unable to get poster details',error)

                            }

                        } else{
                            var response = await fetch(`/api/show/movie/${value.poster_id}?token=${context.state.auth_token}`);
                            try{
                                nl = await response.json();
                                ml = nl.map(item => item.venue_id);
                            } catch(error){
                                console.error('Unable to get poster details',error)

                            }
                        }
                        
                        context.commit('set_filter_ids',ml);
                        context.commit('set_booking_data',nl);

                } catch (error) {
                        console.error('Error fetching data:', error);
                    }
        }
    },
})
  

Vue.component('movie_menu', {
    props: ["title"],
    template: `
    <div>
        <div v-if="invenue">
            <img  :src="'/static/image/venue_'+this.$store.state.poster_details.poster_id+'.jpg'" alt="Example Image" class="d-block w-100" >
            <div class="carousel-caption d-none d-md-block">
                <h5>{{this.$store.state.poster_details.name}}</h5>
                <p>{{this.$store.state.poster_details.caption}}</p>
                <h2>Love, Drama, Music, 2023</h2>
            </div>
        </div>

        <div class="row container mx-auto my-5 " style="background-color:rgb(14, 15, 15);">            
            <div  v-for="movie in filtered_movies" class="card mb-5" style="width: 18rem; border-color: rgb(5, 0, 0); background-color:rgb(14, 15, 15);">
                <img   :src="'static/image/movie_'+movie.id+'.jpg'" class="img-fluid " alt="..." width="350" height="200">
                <div class="card-body bg-dark">
                    <div v-if="invenue">
                        <a    @click="make_booking_visible(movie.id)"   data-toggle="modal" data-target="#exampleModal"  style="color:rgb(208, 72, 144);font-size: 15px; text-decoration: none;" >{{movie.name}}</a>
                    </div>
                    <div v-else>
                        <a    @click="set_poster(movie.id,movie.name,movie.tags,movie.caption)" style="color:rgb(208, 72, 144);font-size: 15px; text-decoration: none;" >{{movie.name}}</a>
                    </div>
                    <p style="color:white;font-size: 10px;" class="card-text">{{movie.caption}}</p>
                    <p class="card-text"><small style="color:whitesmoke">{{movie.tags}}</small></p>
                </div>
            </div>           
        </div>
    </div>
        `,
    data: function () {
        return {
            all_movies:[],
        }
    },
    methods: {
        make_booking_visible(id){
            tl = this.$store.state.booking_data;
            tl=tl.filter(item => item.movie_id==id);
            tl.push(...this.$store.state.booking_visible_ids);
            this.$store.commit('set_booking_visible_ids',tl);
        },
        set_poster(id,name,tags,caption){
            value={'poster_id':id,'current_page':"venue",'name':name,'caption':caption,'tags':tags}
            console.log(value);
            this.$store.commit('set_poster_details',value);
            this.$store.dispatch('filter_ids_fetch',value);
            this.$store.commit('set_booking_visible_ids',[]);

        },
        
        async fetchData() {
            try {
                const response = await fetch(`/api/movie/0?token=${this.$store.state.auth_token}`);
                const data = await response.json();
                this.all_movies=data;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
    },
    computed: {
        filtered_movies(){
            console.log("filter movies")

            if((this.$store.state.poster_details.current_page=='movie') && !(this.$store.state.poster_details.poster_id==null)){
                filter1 = this.all_movies.filter(movie  => this.$store.state.filter_ids.includes(movie.id));
            } else{
                filter1=this.all_movies;
            }

            tl=[];
            for (var movie of filter1){
                const match = movie.tags.toLowerCase().includes(this.$store.state.search_query.toLowerCase());
                if(match){
                    tl.push(movie);
                }
            }
            return tl;

        },
        invenue(){
            if(this.$store.state.poster_details.current_page=="movie" && !(this.$store.state.poster_details.poster_id==null)){
                return true
            }
            else{
                return false
            }
        },
        
    },
    
    async created(){
        this.fetchData();

    },
})

//-------------------------------------------------------------------------------------------------------------------------------------
Vue.component('venue_menu', {
    props: ["title"],
    template: `
    <div>
        <div v-if="inmovie">
            <img  :src="'/static/image/movie_'+this.$store.state.poster_details.poster_id+'.jpg'" alt="Example Image" class="d-block w-100" >
            <div class="carousel-caption d-none d-md-block">
                <h5>{{this.$store.state.poster_details.name}}</h5>
                <p>{{this.$store.state.poster_details.caption}}</p>
                <h2>{{this.$store.state.poster_details.tags}}</h2>
            </div>
        </div>

        <div class="row container mx-auto my-5 " style="background-color:rgb(14, 15, 15);">            
            <div  v-for="venue in filtered_venues" class="card mb-5" style="width: 18rem; border-color: rgb(5, 0, 0); background-color:rgb(14, 15, 15);">
                <img   :src="'static/image/venue_'+venue.id+'.jpg'" class="img-fluid " alt="..." width="350" height="200">
                <div class="card-body bg-dark">
                    <div v-if="inmovie">
                        <a    @click="make_booking_visible(venue.id)"  data-toggle="modal" data-target="#exampleModal" :data-whatever1="venue.id" :data-whatever2="movie_id" style="color:rgb(208, 72, 144);font-size: 15px; text-decoration: none;" >{{venue.name}}</a>
                    </div>
                    <div v-else>
                        <a   @click="set_poster(venue.id,venue.name,venue.caption,venue.city)" style="color:rgb(208, 72, 144);font-size: 15px; text-decoration: none;" >{{venue.name}}</a>
                    </div>
                    <p style="color:white;font-size: 10px;" class="card-text">{{venue.caption}}</p>
                    <p class="card-text"><small style="color:whitesmoke">Capacity : {{venue.capacity}} City : {{venue.city}}</small></p>
                </div>
            </div>           
        </div>
    </div>
        `,
    data: function () {
        return {
            all_venues:[],
        }
    },
    methods: {
        make_booking_visible(id){
            tl = this.$store.state.booking_data;
            tl=tl.filter(item => item.venue_id==id);
            tl.push(...this.$store.state.booking_visible_ids);
            this.$store.commit('set_booking_visible_ids',tl);
        },
        set_poster(id,name,caption,city){
            value={'poster_id':id,'current_page':"movie",'name':name,'caption':caption,'city':city}
            this.$store.commit('set_poster_details',value);
            this.$store.dispatch('filter_ids_fetch',value);
            this.$store.commit('set_booking_visible_ids',[]);

        },
        
        async fetchData() {
            try {
                const response = await fetch(`/api/venue/0?token=${this.$store.state.auth_token}`);
                const data = await response.json();
                this.all_venues=data;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        


    },
    computed: {
        filtered_venues(){
            
            if((this.$store.state.poster_details.current_page=='venue') && !(this.$store.state.poster_details.poster_id==null)){
                filter1 = this.all_venues.filter(venue  => this.$store.state.filter_ids.includes(venue.id));
            } else{
                filter1=this.all_venues;
            }

            tl=[];
            for (var venue of filter1){
                const match = venue.city.toLowerCase().includes(this.$store.state.search_query.toLowerCase());
                if(match){
                    tl.push(venue);
                }
            }
            return tl;

        },
        inmovie(){
            if(this.$store.state.poster_details.current_page=="venue" && !(this.$store.state.poster_details.poster_id==null)){
                this.movie_id=this.$store.state.poster_details.poster_id

                return true
            }
            else{
                return false
            }

        },
        
    },
    async created(){
        this.fetchData();

    },
})


//-------------------------------------------------------------------------------------------------------------------------------------
Vue.component('navbar', {
    props: ["title"],
    template: `
    <div>
    <nav class="navbar navbar-expand-lg navbar-light   sticky-top" style="background-color:rgb(14, 15, 15);">
        <div class="container-fluid">
            <a class="navbar-brand text-light" href="#">BookMyTicket</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">

                    <li class="nav-item">
                        <a  class="nav-link active text-light" aria-current="page" @click="setmovie">Movie</a>
                    </li>
                    <li class="nav-item">
                        <a  class="nav-link active text-light" aria-current="page" @click="setvenue">Venue</a>
                    </li>
                </ul>
                <div class="d-flex " >
                    <input class="form-control me-2" type="search" placeholder="Movie, Tags, dd-mm" aria-label="Search" id="keyword" name="keyword" v-model:value="query" >
                </div>
                <div class="mx-2">
                    <button class="btn btn-light" @click="setprofile">Profile</button>
                    <button class="btn btn-light" onclick="window.location.href ='/logout';">LogOut</button>
                </div>
            </div>
        </div>
    </nav>
    </div>
    `,
    data: function () {
        return {
            'query':""
        }
    },
    methods: {
        setmovie(){
            console.log("set movie")
            this.$store.commit('set_poster_details',{'poster_id':null,'current_page':"movie"})
        },
        setvenue(){
            this.$store.commit('set_poster_details',{'poster_id':null,'current_page':"venue"})
        },
        setprofile(){
            this.$store.commit('set_poster_details',{'poster_id':null,'current_page':"profile"})
        },
    },
    watch:{
        query(new_value,old_value){
        this.$store.commit('change_query',new_value);
        },
    },
})

//-------------------------------------------------------------------------------------------------------------------------------------


Vue.component('booking_model', {
    props: ["title"],
    template: `
    <div class="modal fade " id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog " role="document">
            <div class="modal-content bg-dark" >
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Booking</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <input type="number" id="booknticket" required   placeholder="Number of ticket" v-model:value="number_of_ticket">
                    <table class="table   text-light" id="bookingtable">
                        <tr>
                            <th class="text-light">Date</th>
                            <th class="text-light">Price</th>
                            <th class="text-light">Left</th>
                            <th class="text-light">Time</th>
                            <th class="text-light">Book</th>     
                        </tr>

                        <tr v-for="entry in this.$store.state.booking_visible_ids">
                            <td class="text-light">{{entry.date}}</td>
                            <td class="text-light">{{entry.price}}</td>
                            <td class="text-light">{{entry.remaining_capacity}}</td>
                            <td class="text-light">{{entry.start_time}}</td>
                            <td @click="bookticket(entry.id,entry.remaining_capacity)"   class="text-light">Book</td>

                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function () {
        return {
            number_of_ticket:1,
            'query':""
        }
    },
    methods: {
        bookticket(id,rticket){
            if (rticket<this.number_of_ticket){
                alert("Not enough Tickets")

            }else{
            fetch(`/api/tbook?id=${id}&nticket=${this.number_of_ticket}&token=${this.$store.state.auth_token}`);
            window.location.reload();
            }
        }
        
    },
    computed: {
    },
    watch:{
   
    },
})


//-------------------------------------------------------------------------------------------------------------------------------------

Vue.component('profile_menu', {
    props: ["title"],
    template: `
        <div>
          <div class="text-center">
            <img :src="'/static/image/user_'+this.data.user_id+'.jpg'" class="rounded-circle" alt="..." width="200" height="200">
            <p class="text-center fw-bold text-primary">{{ data.name }}</p>
            <p class="text-center fw-bold text-secondary">Age: {{ data.age }}</p>
            <p class="text-center fw-bold text-secondary">Sex: {{ data.gender }}</p>
            <p class="text-center fw-bold text-secondary">User name: {{ data.username }}</p>
          </div>
    
          <div class="container mx-10">
            <p class="text-start fw-bold text-secondary">Bookings</p>
            <table class="table table-striped table-hover text-light">
              <tr class="text-light">
                <th>Movie</th>
                <th>Venue</th>
                <th>Date</th>
                <th>No Of Ticket</th>
                <th>Rate</th>
              </tr>
              <tr v-for="item in tab" class="text-light" :key="item[0]">
                <td>{{ item[0] }}</td>
                <td>{{ item[1] }}</td>
                <td>{{ item[2] }}</td>
                <td>{{ item[3] }}</td>
                <td>
                  <form @submit.prevent="submitRate(item[5], item[4])">
                    <input type="text" id="id" name="id" :value="item[5]" hidden>
                    <input type="number" id="rate" name="rate" v-model="item[4]" size="1" max="5" min="1">
                    <button type="submit" class="bg-light" size="1">Rate</button>
                  </form>
                </td>
              </tr>
            </table>
          </div>
        </div>
      `,
    data() {
        return {
            data:{
                user_id:null,
                name: "", 
                age: null, 
                gender: "", 
                username: "" 
            },
            tab: [] ,

        }
      },
      methods: {
        submitRate(id, rate) {
          // Implement your rate submission logic here
        },
        async fetchData() {
            try {
                const response = await fetch(`/api/user?token=${this.$store.state.auth_token}`);
                const res = await response.json();
                this.data = res;          
            } catch (error) {
                console.error('Error fetching data:', error);
            }

            try {
                    const response = await fetch(`/api/booking?token=${this.$store.state.auth_token}`);
                    const res = await response.json();
                    this.tab = res;          
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
        },
          
      },
      async created(){
        this.fetchData();
    },
      
})

//----------------------------------------------------------------------------------------------------------------------------------------------------
var app = new Vue({
    el: '#app',
    store:store,
    data: {
    },
    methods: {
        
    },
    computed:{
        current_page() {
            console.log("in main app")
            return this.$store.state.poster_details.current_page;
        },
    },   
    
})