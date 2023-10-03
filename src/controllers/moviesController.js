const { response } = require('express');
const db = require('../database/models');
const sequelize = db.sequelize;
const moment = require('moment')

//Otra forma de llamar a los modelos
const Movies = db.Movie;

const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                return res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                return res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                return res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                return res.render('recommendedMovies.ejs', {movies});
            });
    }, //Aqui debemos modificar y completar lo necesario para trabajar con el CRUD
    add: function (req, res) {
        return res.render('moviesAdd')
    },
    create: function (req, res) {
        const {title, rating, release_date, awards, length, genre_id} = req.body;  //Recibo del body todos los datos desestructurados
        db.Movie.create({
            title : title.trim(), 
            rating,
            awards,
            release_date,
            length,
            genre_id
        })
        .then(movie => {
            console.log(movie)
            return res.redirect('/moviesList ')
        })
    },
  
    edit: function(req, res) {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                console.log(moment(movie.release_date).format('YYYY-MM-DD'))
                return res.render('moviesEdit',{
                    Movie : movie,
                    moment
                })
            })
            .catch(error => console.log(error))
    },
    update: function (req,res) {
        const {title, rating, release_date, awards, length, genre_id} = req.body;  
        db.Movie.update( 
            {
                title : title.trim(), //QUe quier actulizar 
                rating,
                awards,
                release_date,
                length,
                genre_id
            },
            {
                where : { //Donde lo quiero actualizar
                    id : req.params.id
                }
            }
        )
        .then(response => {
            console.log(response)
            db.Movie.findByPk(req.params.id)
                .then(movie => {
                    return res.render('moviesDetail', {
                        movie
                    })
                })
        })
        .catch(error => console.log(error))
    },
    delete: function (req, res) {
        db.Movie.findByPk(req.params.id).then((movie)=>{
            return res.render('moviesDelete.ejs', {Movie : movie})
        })
    },
    destroy: function (req, res) {
        const {id} = req.params;
        db.ActorMovie.destroy({
            where : {
                movie_id : id
            }
        })
        .then(response => {
            console.log(response);

            db.Actor.update(
                {
                    favorite_movie_id : null
                },
                {
                    where : {
                        favorite_movie_id : id
                    }
                }
            )
            .then(response => {
                console.log(response)
                    db.Movie.destroy({
                        where : {
                            id
                        }
                    })
                    .then(response => {
                        console.log(response);
                        return res.redirect('/movies')
                    })
                })
        }).catch(error => console.log(error))
    }

}

module.exports = moviesController;