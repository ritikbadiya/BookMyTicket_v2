const store = new Vuex.Store({
    state: {
      search_query:'',
      current_page:"movie",
      venue_name:[],
      movie_name:[],
      auth_token:localStorage.getItem('authToken'),
    },
    mutations: {
        change_query(state,value){
            state.search_query=value;
        },     
        set_current_page(state,data){
            state.current_page = data;
        },
        set_venue_name(state,data){
            state.venue_name=data
        },
        set_movie_name(state,data){
            state.movie_name=data
        },

    },
    actions: {     

    },
})


Vue.component('movie_menu', {
    props: ["title"],
    template: `
    <div>
        <!--Update movie -->
        <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
            aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Update Movie</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="update_movie" enctype="multipart/form-data">
                            <div class="form-group">

                                <input type="hidden" class="form-control" id="id" name="id" :value="current_movie.id">
                                <input type="hidden" class="form-control" id="nam" name="nam">

                                <label for="name" class="col-form-label">Name</label>
                                <input type="text" class="form-control" id="name" name="name" :value="current_movie.name"  required maxlength="40">

                                <label for="caption" class="col-form-label">Caption</label>
                                <input type="text" class="form-control" id="caption" name="caption" maxlength="110" :value="current_movie.caption" required>

                                <label for="tags" class="col-form-label">Tags</label>
                                <input type="text" class="form-control" id="tags" name="tags" required maxlength="60" :value="current_movie.tags">

                                <label for="image" class="form-label">Image</label>
                                <input type="file" class="form-control" id="image" name="image" accept="image/*">

                                <br>
                                <button @click="update_movie" class="btn btn-primary">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>


        <!--addshow -->
        <div class="modal fade" id="addshowModal" tabindex="-1" role="dialog" aria-labelledby="addshowModalLabel"
            aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addshowModalLabel">Add Show</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form  method="POST" enctype="multipart/form-data" id="add_show">
                            <div class="form-group">
                                <label for="Movie" class="col-form-label">Movie</label>
                                <input type="text" class="form-control" id="Movie" name="Movie" :value='current_movie.name' hidden>
                                <input type="text" class="form-control" id="Movies" name="Movies"  :value='current_movie.name'  disabled>

                                <label for="Venue" class="form-label">Venue</label>
                                <select class="form-select" aria-label="emailHelp" id="Venue" name="Venue" required>
                                        <option v-for="i in this.$store.state.venue_name" :value="i">{{i}}</option>
                                </select>

                                <label for="Price" class="form-label">Price</label>
                                <input type="number" class="form-control" id="Price" name="Price"
                                    aria-describedby="emailHelp" min="0" max="99999" required>



                                <label for="Date" class="form-label">Date</label>
                                <input type="date" class="form-control" id="Date" name="Date" aria-describedby="emailHelp"
                                    required  min="2023-04-01" max="2023-05-31">

                                <label for="Start" class="form-label">Start Time</label>
                                <input type="time" class="form-control" id="Start" name="Start" aria-describedby="emailHelp"
                                    required>

                                <label for="End" class="form-label">End Time</label>
                                <input type="time" class="form-control" id="End" name="End" aria-describedby="emailHelp"
                                    required>


                                <button @click="add_show" class="btn btn-primary ">+Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>


        <!--Add movie -->
        <div class="modal fade" id="AddmovieModal" tabindex="-1" aria-labelledby="AddmovieLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="AddmovieLabel">Add Movie</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form  method="POST" enctype="multipart/form-data" id="add_movie">
                            <div class="mb-1">
                                <label for="Name" class="form-label">Name</label>
                                <input type="text" class="form-control" id="Name" name="Name" aria-describedby="emailHelp"
                                    required onkeyup="validate(event)" maxlength="40">

                                <label for="Caption" class="form-label">Caption</label>
                                <input type="text" class="form-control" id="Caption" name="Caption"
                                    aria-describedby="emailHelp" required maxlength="110">



                                <label for="Tags" class="form-label">Tags</label>
                                <input type="text" class="form-control" id="Tags" name="Tags" aria-describedby="emailHelp"
                                    placeholder="action,drama,comedy" required maxlength="60">

                                <label for="image" class="form-label">Image</label>
                                <input type="file" class="form-control" id="image" name="image" accept="image/*" required>

                                <br>
                                <button @click="add_movie" class="btn btn-primary ">Add Movie</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>



        <div   class="row  mx-auto my-5 container" style="background-color:rgb(14, 15, 15);">
            <div v-for="i in filtered_movies" class="card mb-5" style="width: 18rem; border-color: rgb(5, 0, 0); background-color:rgb(14, 15, 15);">
                <img :src="get_movieimage(i.id)" class="img-fluid " alt="..." width="350" height="200">
                <div class="card-body bg-dark">
                    <div class="dropdown">
                        <button class="btn  btn-sm " type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <p> <a @click="set_current_movie(i)" style="color:rgb(208, 72, 144);font-size: 15px; text-decoration: none;" >{{i.name}}</a></p>
                        </button>
                        <ul class="dropdown-menu">
                            <li><button type="button" class="dropdown-item" data-toggle="modal" data-target="#exampleModal"
                                    data-whatever1="i.id" data-whatever2="i.name"
                                    data-whatever3="i.caption" data-whatever4="i.tags">Update</button>
                            </li>

                            <li><button type="button" class="dropdown-item" data-toggle="modal" data-target="#addshowModal" >AddShow</button>
                            </li>

                            <li><button type="button" class="dropdown-item" @click="deletemovie(i.id)"> Delete</button></li>
                        </ul>
                    </div>

                    <p style="color:white;font-size: 10px;" class="card-text">{{i.caption}}</p>
                    <p class="card-text"><small style="color:whitesmoke">{{i.tags}}</small></p>
                </div>
            </div>
        </div>
    </div>
        `,
    data: function () {
        return {
            all_movies:[],
            current_movie:{},
        }
    },
    methods: {
        set_current_movie(movie){
            this.current_movie = movie;

        },
        get_movieimage(movie_id) {
            return (`/static/image/movie_${movie_id}.jpg`);
        },
        
        async fetchData() {
            try {
                const response = await fetch(`/api/movie/0?token=${this.$store.state.auth_token}`);
                const data = await response.json();
                this.all_movies=data;
                movie_name=data.map(item => item.name);
                this.$store.commit('set_movie_name',movie_name);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        async deletemovie(id){
            try {
                    const response = await fetch(`/api/movie/${id}?token=${this.$store.state.auth_token}`,{method:'DELETE'});
                    const data = await response.json();
                    location.reload();
                } catch (error) {
                    console.error('Error deleting movie:', error);
                }


        },
        async add_movie(){
            const form = document.getElementById('add_movie');
            const formData = new FormData(form);
            fetch('/api/movie?token=' + this.$store.state.auth_token, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });

        },
        async add_show(){
            const form = document.getElementById('add_show');
            const formData = new FormData(form);
            fetch('/api/show?token=' + this.$store.state.auth_token, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });

        },
        async update_movie(){
            const form = document.getElementById('update_movie');
            const formData = new FormData(form);
            fetch('/api/movie?token=' + this.$store.state.auth_token, {
                method: 'PUT',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });

        },
    },
    computed: {
        filtered_movies(){
            tl=[];
            for (var movie of this.all_movies){
                const match = movie.tags.toLowerCase().includes(this.$store.state.search_query.toLowerCase());
                if(match){
                    tl.push(movie);
                }
            }
            return tl;
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
        <!--Add Venue -->
        <div class="modal fade" id="AddvenueModal" tabindex="-1" aria-labelledby="AddvenueLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="AddvenueLabel">Add Venue</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form  method="POST" enctype="multipart/form-data" id="add_venue">
                            <div class="mb-1">
                                <label for="Name" class="form-label">Name</label>
                                <input type="text" class="form-control" id="Name" name="Name" aria-describedby="emailHelp"
                                    required onkeyup="validate(event)" maxlength="40">

                                <label for="Caption" class="form-label">Caption</label>
                                <input type="text" class="form-control" id="Caption" name="Caption"
                                    aria-describedby="emailHelp" required maxlength="70">

                                <label for="Capacity" class="form-label">Capacity</label>
                                <input type="number" class="form-control" id="Capacity" name="Capacity"
                                    aria-describedby="emailHelp" required min="30" max="5000">

                                <label for="City" class="form-label">City</label>
                                <input type="text" class="form-control" id="City" name="City" aria-describedby="emailHelp"
                                    required maxlength="20">

                                <label for="Address" class="form-label">Address</label>
                                <input type="text" class="form-control" id="Address" name="Address"
                                    aria-describedby="emailHelp" required maxlength="60">


                                <label for="image" class="form-label">Image</label>
                                <input type="file" class="form-control" id="image" name="image" accept="image/*" required>

                                <br>
                                <button @click="add_venue" class="btn btn-primary ">Add Venue</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>


        <!--Update venue -->
        <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
            aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Update Venue</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form  enctype="multipart/form-data" id="update_venue">
                            <div class="form-group">

                                <input type="hidden" class="form-control" id="id" name="id" :value='current_venue.id'>
                                <input type="hidden" class="form-control" id="nam" name="nam">



                                <label for="name" class="col-form-label">Name</label>
                                <input type="text" class="form-control" id="name" name="name"  required maxlength="40" :value='current_venue.name'>

                                <label for="caption" class="col-form-label">Caption</label>
                                <input type="text" class="form-control" id="caption" name="caption" maxlength="130" required :value='current_venue.caption'>

                                <label for="capacity" class="col-form-label">Capacity</label>
                                <input type="number" class="form-control" id="capacity" name="capacity" required min="30" max="5000" :value='current_venue.capacity'>

                                <label for="city" class="col-form-label">City</label>
                                <input type="text" class="form-control" id="city" name="city" required maxlength="20" :value='current_venue.city'>


                                <label for="address" class="col-form-label">Address</label>
                                <input type="text" class="form-control" id="address" name="address" required maxlength="60" :value='current_venue.address'>

                                <label for="image" class="form-label">Image</label>
                                <input type="file" class="form-control" id="image" name="image" accept="image/*" >

                                <br>
                                <button @click="update_venue" class="btn btn-primary">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!--addshow -->
        <div class="modal fade" id="addshowModal" tabindex="-1" role="dialog" aria-labelledby="addshowModalLabel"
            aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addshowModalLabel">Add Show</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form  method="POST" enctype="multipart/form-data" id="add_show">
                            <div class="form-group">


                                <label for="Movie" class="form-label">Movie</label>
                                <select class="form-select" aria-label="emailHelp" id="Movie" name="Movie" required>
                                    <option v-for="i in this.$store.state.movie_name" :value="i">{{i}}</option>
                                </select>

                                <label for="Venue" class="col-form-label">Venue</label>
                                <input type="text" class="form-control" id="Venue" name="Venue" :value='current_venue.name'  hidden>
                                <input type="text" class="form-control" id="Venues" name="Venues" :value='current_venue.name' disabled>

                                <label for="Price" class="form-label">Price</label>
                                <input type="number" class="form-control" id="Price" name="Price" aria-describedby="emailHelp" min="0" max="99999" required>



                                <label for="Date" class="form-label">Date</label>
                                <input type="date" class="form-control" id="Date" name="Date" aria-describedby="emailHelp" required min="2023-04-01" max="2023-05-31">

                                <label for="Start" class="form-label">Start Time</label>
                                <input type="time" class="form-control" id="Start" name="Start" aria-describedby="emailHelp"
                                    required>

                                <label for="End" class="form-label">End Time</label>
                                <input type="time" class="form-control" id="End" name="End" aria-describedby="emailHelp"
                                    required>


                                <button @click="add_show" class="btn btn-primary ">+Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>


        <div class="row container mx-auto my-5 " style="background-color:rgb(14, 15, 15);">
            <div v-for="i in filtered_venues" class="card mb-3" style="width: 18rem; border-color: rgb(5, 0, 0); background-color:rgb(14, 15, 15);">
                <img :src="get_venueimage(i.id)" class="img-fluid " alt="..." width="350" height="200">
                <div class="card-body bg-dark">
                    <div class="dropdown">
                        <button class="btn  btn-sm " type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <h5> <a @click="set_current_venue(i)" style="color:rgb(208, 72, 144);font-size: 15px; text-decoration: none;" >{{i.name}}</a></h5>
                        </button>
                        <ul class="dropdown-menu">
                            <li>
                                <button type="button" class="dropdown-item" data-toggle="modal" data-target="#exampleModal"
                                data-whatever1="i.id" data-whatever2="i.name"
                                data-whatever3="i.caption" data-whatever4="i.capacity"
                                data-whatever5="i.city" data-whatever6="i.address">Update</button>
                            </li>

                            <li>
                                <button type="button" class="dropdown-item" data-toggle="modal" data-target="#addshowModal" >AddShow</button>
                            </li>

                            <li><button class="dropdown-item " @click="deletevenue(i.id);"> Delete</button></li>
                            <li><button class="dropdown-item " @click="export_venue(i.id);"> Export Venue</button></li>

                        </ul>
                    </div>

                    <p style="color:white;font-size: 10px;" class="card-text">{{i.caption}}</p>
                    <p class="card-text"><small style="color:whitesmoke">Capacity : {{i.capacity}}
                            &nbsp&nbsp&nbsp&nbspCity : {{i.city}}</small></p>

                </div>
            </div>

        </div>
    </div>
        `,
    data: function () {
        return {
            all_venues:[],
            current_venue:{},
        }
    },
    methods: {
        set_current_venue(venue){
            this.current_venue = venue;

        },
        get_venueimage(venue_id) {
            return (`/static/image/venue_${venue_id}.jpg`);
        },
        
        async fetchData() {
            try {
            const response = await fetch(`/api/venue/0?token=${this.$store.state.auth_token}`);
            const data = await response.json();
            this.all_venues=data;
            venue_name=data.map(item => item.name);
            console.log(venue_name);
            this.$store.commit('set_venue_name',venue_name);
            } catch (error) {
            console.error('Error fetching data:', error);
            }
        },
        async deletevenue(id){
            try {
                const response = await fetch(`/api/venue/${id}?token=${this.$store.state.auth_token}`,{method:'DELETE'});
                const data = await response.json();
                location.reload();
                } catch (error) {
                console.error('Error deleting Venue:', error);
                }


        },
        async export_venue(id){
            try {
                const response = await fetch(`/api/export_venue/${id}?token=${this.$store.state.auth_token}`);
                const data = await response.json();
                location.reload();
                } catch (error) {
                console.error('Error Exporting Venue:', error);
                }


        },
        async add_venue(){
            const form = document.getElementById('add_venue');
            const formData = new FormData(form);
            fetch('/api/venue?token=' + this.$store.state.auth_token, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });

        },
        async add_show(){
            const form = document.getElementById('add_show');
            const formData = new FormData(form);
            fetch('/api/show?token=' + this.$store.state.auth_token, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });

        },
        async update_venue(){
            const form = document.getElementById('update_venue');
            const formData = new FormData(form);
            fetch('/api/venue?token=' + this.$store.state.auth_token, {
                method: 'PUT',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });

        },
        
    },
    computed: {
        filtered_venues(){
            tl=[];
            for (var venue of this.all_venues){
                const match = venue.city.toLowerCase().includes(this.$store.state.search_query.toLowerCase());
                if(match){
                    tl.push(venue);
                }
            }
            return tl;
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
                        <a class="nav-link active text-light" aria-current="page" @click="setmovie">Movie</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active text-light" aria-current="page" @click="setvenue">Venue</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active text-light" aria-current="page" @click="setshow">Show</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active text-light" aria-current="page" @click="setsummary">Summary</a>
                    </li>
                </ul>
                <div class="d-flex " >
                    <input class="form-control me-2" type="search" placeholder="Movie, Tags, dd-mm" aria-label="Search" id="keyword" name="keyword" v-model:value="query" >
                </div>
                    <div class="mx-2">
                        <button v-if="this.$store.state.current_page=='movie'" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#AddmovieModal">AddMovie</button>
                        <button v-if="this.$store.state.current_page=='venue'" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#AddvenueModal">AddVenue</button>
                        <button class="btn btn-light" onclick="window.location.href ='/logout';">LogOut</button>
                        <button class="btn btn-light" @click="downloadFile">export</button>
                        
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
            this.$store.commit('set_current_page',"movie");
        },
        setvenue(){
            this.$store.commit('set_current_page',"venue");
        },
        setshow(){
            this.$store.commit('set_current_page',"show");
        },
        setsummary(){
            this.$store.commit('set_current_page',"summary");
        },
        downloadFile() {
            // Prompt the user for a token
            const token = prompt('Enter token for download:');
      
            // Send a request to the download route
            if (token) {
              const url = `/api/download_file/${token}`;
              window.location.href = url; // Redirect to the download URL
            }
          },
    },
    computed: {
    },
    watch:{
        query(new_value,old_value){
        this.$store.commit('change_query',new_value);

        },

    },
})

//-------------------------------------------------------------------------------------------------------------------------------------
Vue.component('show_menu', {
    props: ["title"],
    template: `
    <div class="container mx-10">
        <p class="text-start fw-bold text-secondary">Shows</p>
        <table class="table table-striped table-hover">
            <tr>
                <th class="text-light">Movie</th>
                <th class="text-light">Venue</th>
                <th class="text-light">Price</th>
                <th class="text-light">Left</th>
                <th class="text-light">Date</th>
                <th class="text-light">Start</th>
                <th class="text-light">End</th>
                <th class="text-light">Action</th>
            </tr>
            <tr v-for="i  in this.filtered_show">
                <td class="text-light">{{i.movie_name}}</td>
                <td class="text-light">{{i.venue_name}}</td>
                <td class="text-light">{{i.price}}</td>
                <td class="text-light">{{i.remaining_capacity}}</td>
                <td class="text-light">{{i.date}}</td>
                <td class="text-light">{{i.start_time}}</td>
                <td class="text-light">{{i.end_time}}</td>
                <td class="text-light" @click='deleteshow(i.id)'>Delete</td>

            </tr>
            
        </table>
    </div>`,
    data: function () {
        return {
            all_shows:[],
        }
    },
    methods: {
        async fetchData() {
            try {
            const response = await fetch(`/api/show?token=${this.$store.state.auth_token}`);
            const data = await response.json();
            this.all_shows=data;
            } catch (error) {
            console.error('Error fetching data:', error);
            }
        },
        async deleteshow(id){
            try {
                const response = await fetch(`/api/show/${id}?token=${this.$store.state.auth_token}`,{method:'DELETE'});
                const data = await response.json();
                location.reload();
                } catch (error) {
                console.error('Error deleting movie:', error);
                }


        }
    },
    computed: {
        filtered_show(){
            tl=[];
            for (var show of this.all_shows){
                const match = show.movie_name.toLowerCase().includes(this.$store.state.search_query.toLowerCase()) || show.venue_name.toLowerCase().includes(this.$store.state.search_query.toLowerCase());
                if(match){
                    tl.push(show);
                }
            }
            return tl;
        },     
        
    },   
    async created(){
        this.fetchData();

    },
})




//-------------------------------------------------------------------------------------------------------------------------------------
Vue.component('summary_menu', {
    props: ["title"],
    template: `
    <div class="m-4">
        <div class="row">
            <div class="col-6">
                <div class="card border-primary mb-4">
                    <div class="card-body text-primary">
                        <h5 class="card-title">Houseful show</h5>
                        <p class="card-text">{{summary_data.hfs}}</p>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card border-secondary mb-4">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Movies Above 4 Star</h5>
                        <p class="card-text">{{summary_data.star}}</p>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card border-success mb-4">
                    <div class="card-body text-success">
                        <h5 class="card-title">Most Engaged Venue</h5>
                        <p class="card-text">{{summary_data.venue}}</p>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="card border-danger mb-4">
                    <div class="card-body text-danger">
                        <h5 class="card-title">Most Popular Movie</h5>
                        <p class="card-text">{{summary_data.movie}}</p>
                    </div>
                </div>
            </div>
            
        </div>
    </div>`,
    data: function () {
        return {
            summary_data:{},
        }
    },
    methods: {
        async fetchData() {
            try {
            const response = await fetch(`/api/summary?token=${this.$store.state.auth_token}`);
            const data = await response.json();
            this.asummary_data=data;
            } catch (error) {
            console.error('Error fetching data:', error);
            }
        },
        async deleteshow(id){
            try {
                const response = await fetch(`/api/show/${id}?token=${this.$store.state.auth_token}`,{method:'DELETE'});
                const data = await response.json();
                location.reload();
                } catch (error) {
                console.error('Error deleting movie:', error);
                }


        }
    },
    computed: {
        filtered_show(){
            tl=[];
            for (var show of this.all_shows){
                const match = show.movie_name.toLowerCase().includes(this.$store.state.search_query.toLowerCase()) || show.venue_name.toLowerCase().includes(this.$store.state.search_query.toLowerCase());
                if(match){
                    tl.push(show);
                }
            }
            return tl;
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
            return this.$store.state.current_page;
        },
    },   
    
})