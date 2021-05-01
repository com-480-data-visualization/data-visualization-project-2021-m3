# Project of Data Visualization (COM-480)

| Student's name     | SCIPER |
| ------------------ | ------ |
| Marie Biolková     | 327156 |
| Marija Lazaroska   | 287052 |
| Ljupche Milosheski | 308507 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (23rd April, 5pm)

**10% of the final grade**

### Dataset

We created our dataset by scraping data from [Wikipedia](https://en.wikipedia.org/wiki/List_of_Grand_Slam_singles_finals) and [Ultimate Tennis Statistics](https://www.ultimatetennisstatistics.com/). Our data consists of:

- The Grand Slam singles finals dataset, both for [men](data/men_finals.csv) and [women](data/women_finals.csv) 
- Information about the players dataset, both for [men](data/men_players_info.csv) and [women](data/women_players_info.csv) 
- Statistics on the final match dataset, only for [men](data/men_match_stats.csv) 

Unfortunately we weren't able to find a dataset or create one on our own for the statistics on the final match for the female players. Therefore we intend to continue on working with the datasets we have and provide visualizations for the data we managed to scrape.

We also found an additional dataset containing the prize money for the Grand Slam finalists ([Grand Slam prize money](https://github.com/popovichN/grand-slam-prize-money/blob/master/tennis_pay.csv)). However the prize values in the dataset are in different currencies and it is also difficult to account for the inflation. In addition the dataset has missing data since it contains entries only for the prize money from the tournaments until 2015. Therefore we are not certain if we would use it for now. 

The obtained datasets including the information about the players have some missing data since they include records for tennis players that played in the Grand Slams dating from 1968. For some of the players we managed to manually fill in some missing information such as exact date of birth, and we left it empty for the rest.

The women and men finalists datasets didn't require a lot of preprocessing steps. We changed some of the strings into numerical values (the column Year), discarded the records from years before the Open Era (1968-) and changed the format of some of the tournament names. 

The match statistics for men include a lot of numerical values, however we kept those values in our dataset as string objects since our initial plan is to use them only for displaying purposes. For further usage if we decide on using these statistics for deriving other statistics, the values would need to be converted to numerical.

The preprocessing and data-cleaning can be found in the first part of the notebook [here](notebooks/preprocessing_eda.ipynb).

### Problematic

Tennis is one of the most popular individual sports world-wide. Professional tennis events receive a lot of attention, in particular the four major tournaments known as the Grand Slams. In this project, we aim to create an interactive visualization of data from the Grand Slam finals in the [Open Era](https://en.wikipedia.org/wiki/History_of_tennis#Open_Era) (1968-). This will allow the users to travel back in time and explore the careers of the best players in tennis history and their rivalries. The tool should satisfy anyone from the general public: from sports newbies to tennis-savvy users. A typical use case would be sport commentators who would get an intuitive tool and vizualization to search for the players' statistics instead of tedious way of searching through tables.

The visualization will capture two different points of view:
1. The first one will focus on the success of the finalists in terms of the number of wins and runner-ups over a specified period of time for each Grand Slam tournament. This will allow to compare the performance of players who were active during the same time period, as well as across generations.
2. Secondly, by creating a network of players who competed against each other in a Grand Slam final, we will identify some of the greatest rivals as well as one-hit wonders. The user will be able to interact with the graph and select between which 2 players he would like to see the match statistics.

In addition we would like to include the search bar where the user would be able to search for a specific user and the visualizations will be adapted to show the information for that user for the selected period of time.

User profiles and match statistics will provide additional context.

### Exploratory Data Analysis

The dataset contains 472 men's and 445 women's Grand Slam finals, but only 211 of those records (for each gender) correspond to the Open Era. Since the beginning of the Open Era, there have been:

106 different male Grand Slam finalists, including 55 distinct male winners;
94 different female Grand Slam finalists, including 55 distinct female winners.
Roger Federer and Rafael Nadal have both won 20 titles and are therefore tied for the all-time most victories. However, Roger Federer has also lost in 10 Grand Slam finals – he is tied with Ivan for the most frequent runner-up title. Most Nadal's Grand Slam titles come from the French Open.

As for women, Serena Williams dominates the statistics with 23 titles, one more than the second Steffi Graf. An interesting observation is that half of Martina Navratilova's titles come from Wimbledon.

We also tried to visualize the networks of players who encountered each other in the finals. Although this visualization is not very clear due to the relatively large amount of data, we can still get interesting insights from it. Each network (for [men](data/img/network_men.png) and [women](data/img/network_women.png)) has one big densely connected cluster and then some small disconnected parts. The core of the cluster is represented by players who frequently appeared in Grand Slam finals, and we can see the position of the player in the cluster indicates the time during which they were active. For instance, Billie Jean King and Karolína Plíšková are on the different extremes of the network for the latter one is still an active player while the former has retired long ago.

On the margins of the cluster are players who did not play in the finals as often, perhaps only once. The disconnected parts are formed by players who were part of a final in which their appearance was somehow surprising, in the sense that neither of the players ever played against a more "popular" player.

The Jupyter notebook for these analyses (and additional ones) can be found [here](preprocessing_eda.ipynb). 


### Related work

* [DB4Tennis](https://www.db4tennis.com/) and [Ultimate Tennis Statistics](https://www.ultimatetennisstatistics.com/) provide detailed records of tennis tournaments over the years only for male players. Although they give an option to filter, there is a lot of information and the data is shown using static tables. We would like to create more interactive visualizations, focus specifically on Grand Slam finals and include the female players. Furthermore, DB4Tennis requires subscription to view the contents.

* [Grand Slam Stats](https://jpvsilva88.github.io/tennis/) offers an interactive timeline plot showing the number of participants from up to 5 countries through the years for the 4 Grand Slam Tournaments. While we think it is a good idea to introduce a timeline for the data, we would like to show different statistics and allow filtering depending on time. This will allow the user to choose the time period (and range) to be displayed.

* [Men's Tennis: Grand Slam Finalists by Phil Simon](https://www.philsimon.com/blog/data/visualizing-mens-grand-slam-winners/) provides an interactive visualization of Grand Slam finalists focused only on male players. The data is presented only using tables, but we would like to use graphs. In addition we would also consider data concerning female players. 

* [Visualizing Tennis Grand Slam Winners Performances](https://datascienceplus.com/visualizing-tennis-grand-slam-winners-performances/) – This article demonstrates different techniques to visualize data in R using a dataset similiar to the one we intend to use. Some of the visualizations include a chord diagram, a radar plot, a bar plot etc. We will explore different visualization types, including a network graph.

Some examples we were inspired by but are not related to our topic:

* [An analysis of the Beatles by Adam E. McCann](https://www.tableau.com/community/music/beatles#video) is a Sankey diagram that associates The Beatles' songs with the band members that wrote the lyrics. The structure of the graph is very interesting and it gives the user a clear view of which member wrote which song in which year. It also allows the user to select for which band member to see the data, so it would be interesting to apply this in the context of the Grand Slam data.

## Milestone 2 (7th May, 5pm)

**10% of the final grade**

*Two A4 pages describing the project goal.* 

- *Include sketches of the vizualiation you want to make in your final product.* 
- *List the tools that you will use for each visualization and which (past or future) lectures you will need.* 
- *Break down your goal into independent pieces to implement. Try to design a core visualization (minimal viable product) that will be required at the end. Then list extra ideas (more creative or challenging) that will enhance the visualization but could be dropped without endangering the meaning of the project.* 

*Functional project prototype review.* 

- *You should have an initial website running with the basic skeleton of the visualization/widgets.*

- [x] Start HTML – Marie
- [x] Basic CSS formating – Marie
- [ ] Import data about the matches
- [ ] Make a class for Sankey diagram
- [ ] Make a class for network graph
- [ ] Create timeline & [slider](https://observablehq.com/@sarah37/snapping-range-slider-with-d3-brush)
- [ ] Implement switch to female data


## Milestone 3 (4th June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

