const { Client, MessageEmbed } = require('discord.js');
const config = require('./config');
const commands = require('./help');
const Database = require("@replit/database");
const CronJob = require('cron').CronJob;
const Discord = require('discord.js');
const db = new Database()
const ImageCharts = require('image-charts');

let bot = new Client();

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}.`)
});

var daily = new CronJob('00 00 00 * * *', function() {
  addDay();
}, null, true, 'America/Los_Angeles');
daily.start();

var weeklyLeaderboardDisplay = new CronJob('01 00 * * 01', function() {
  weeklyLeaderboard();
}, null, true, 'America/Los_Angeles');
weeklyLeaderboardDisplay.start();

var weeklyResetDatabase = new CronJob('02 00 * * 01', function() {
  weeklyReset();
}, null, true, 'America/Los_Angeles');
weeklyResetDatabase.start();

//db.empty();
//addDay();
//db.set("802735670019883008", [[0],[""],[1,0]]).then(() => {});

const reducer = (accumulator, currentValue) => accumulator + currentValue;

const ranks = {

  10: "828510588434120714",
  50: "828349234981240882",
  100: "828348735263211621",
  200: "828350595080781856",
  300: "828349165671153685",
  500: "828354369488683079",
  666: "828362799930408961"
};

const badges = {
  
  1: "838133498258391040",
  2: "838133498563788841",
  3: "838133499113373726",
  4: "838133499159380049",
  5: "838137909068038254",
  6: "838140490095525908",
  7: "838140635801845761",
  8: "838141333281177600",
  9: "838589328169893918",
  10: "838141546086924348",
  666: "838585089196818434"
};
async function weeklyLeaderboard(){
  bot.channels.cache.get('829092072664465428').send('@everyone');
  bot.channels.cache.get('829092072664465428').send( await showLeaderboard("full"));
  bot.channels.cache.get('829092072664465428').send( await showLeaderboard("winner"));
}


async function showLeaderboard(message){
  var keys;
  let leaderboardReaders = [];
  await db.list().then(val => {keys = val});
  for(i = 0; i < keys.length; i++){


    await db.get(keys[i]).then(value => {
      
      leaderboardReaders.push([keys[i],value[0].reduce(reducer)])

    });

  }
  leaderboardReaders.sort(function(a, b){return b[1]-a[1]});
  let winnerString = `<@${leaderboardReaders[0][0]}>`;
  
  let leaderboardString = "";
  for(i = 0; i < leaderboardReaders.length && i < 10; i++){
    let medal = '';
    switch(i){
      case 0:
        medal = '🥇'
        break
      case 1:
        medal = '🥈'
        break
      case 2:
        medal = '🥉'
        break
    }
    leaderboardString += `\n\n<@${leaderboardReaders[i][0]}> : **${leaderboardReaders[i][1]} Pomodori** ${medal}`
  }
  const embed = new Discord.MessageEmbed()
	.setColor("#00FF00")
	.setTitle("Current Weekly Reading leaderboard")
  .setDescription(`${leaderboardString}`)
	.setTimestamp()

  const winner = new Discord.MessageEmbed()
	.setColor("#00FF00")
	.setTitle("The Winner Of This Weeks Reading Event Is...")
  .setDescription(`**${winnerString}!!!\nResetting Leaderboard...**`)
  .setThumbnail("https://blog.hotmart.com/blog/2019/12/03153330/BLOG_pomodoro-670x419.png")
	.setTimestamp()


  if(message == "full"){
    return embed;
  }
  if(message == "winner"){
    return winner;
  }
  message.channel.send(embed);

}

function addRank(message, total){
  
  for (let i in ranks) {
    role = message.guild.roles.cache.find(role => role.id === ranks[i]);
    message.member.roles.remove(role);
  }

  role = message.guild.roles.cache.find(role => role.id === ranks[666]);

  for (let i in ranks) {
    if(total < i){
      
      role = message.guild.roles.cache.find(role => role.id === ranks[i]);
      break;
    }
  }
  message.member.roles.add(role);

}




function addBadge(message, total){

  for (let i in badges) {
    role = message.guild.roles.cache.find(role => role.id === badges[i]);
    message.member.roles.remove(role);
  }

  role = message.guild.roles.cache.find(role => role.id === badges[666]);

  for (let i in badges) {

    if(total < i/2){
      
      role = message.guild.roles.cache.find(role => role.id === badges[i]);
      break;
    }
  }
  message.member.roles.add(role);

}


function addDay(){
  
  db.list().then(keys => {
    for(let i = 0; i < keys.length; i++){
      db.get(keys[i]).then(value => {

        let newArray = value[0].concat([0])
        let newArrayTwo = value[2]
        newArrayTwo[0] += 1

        newValue = [newArray,value[1],newArrayTwo]
        db.set(keys[i], newValue);

      }); 
    }
  });
}
function weeklyReset(){
  db.list().then(keys => {
    for(let i = 0; i < keys.length; i++){
      db.get(keys[i]).then(value => {
        newValue = [[0],value[1],value[2]]
        db.set(keys[i], newValue);
      }); 
    }
  });
}

function accountMadeEmbed(message){
  const embed = new Discord.MessageEmbed()
	.setColor("#00FF00")
	.setTitle("Your Account Has Been Made")
	.setThumbnail(message.author.avatarURL())
	.setTimestamp()

  message.channel.send(embed);
}

async function readingDataEmbed(message, array, searchId){
  

  let stringGraph = "";
  let stringDays = "";
  for(let i = 0; i < array.length; i++){
    stringDays+=`Day ${i+1}: **${array[i]} Pomodori**\n`
    stringGraph += array.length == i+1 ? `${array[i]}`: `${array[i]},`
  }

  let graph = ImageCharts().cht('lc').chd(`t:${stringGraph}`).chs('700x450').chm('B,FCECF4,0,0,0');

  let graphUrl = await graph.toURL()
    const embed = new Discord.MessageEmbed()
    .setColor("#00FF00")
    .setTitle(`${searchId.username}'s Current Tournament Reading Data`)
    .setThumbnail(`${searchId.avatarURL()}`)
    .addFields(
      { name: 'Days:', value: array.length, inline: true},
      { name: 'Pomodori:', value: array.reduce(reducer), inline: true },
      { name: 'Reading Rate:', value: (array.reduce(reducer)/array.length).toFixed(2) +' per day', inline: true },
    )
    .setImage(graphUrl)
    .setDescription(stringDays)
    .setTimestamp()

    message.channel.send(embed);

  
}

function noAccount(message){
  const embed = new Discord.MessageEmbed()
	.setColor("#FF0000")
	.setTitle("This User Does Not Have An Account Set Up")
	.setTimestamp()

  message.channel.send(embed);
}

function addedPomodoroEmbed(message){
  const embed = new Discord.MessageEmbed()
	.setColor("#00FF00")
	.setTitle("Added 1 Pomodoro to your account!")
	.setThumbnail("https://blog.hotmart.com/blog/2019/12/03153330/BLOG_pomodoro-670x419.png")
	.setTimestamp()

  message.channel.send(embed);
}

function addedBookEmbed(message, book){
  const embed = new Discord.MessageEmbed()
	.setColor("#00FF00")
	.setTitle(`Added ${book} to your library`)
	.setThumbnail("https://blog.hotmart.com/blog/2019/12/03153330/BLOG_pomodoro-670x419.png")
	.setTimestamp()

  message.channel.send(embed);
}

function removeBookEmbed(message){
  const embed = new Discord.MessageEmbed()
	.setColor("#00FF00")
	.setTitle(`Removed The Latest Book From Your Library`)
	.setThumbnail("https://blog.hotmart.com/blog/2019/12/03153330/BLOG_pomodoro-670x419.png")
	.setTimestamp()

  message.channel.send(embed);
}

function wrongChannelEmbed(message){
  const embed = new Discord.MessageEmbed()
	.setColor("#FF0000")
	.setTitle("You Can Only Run Commands In The Add-Pomodoro Channel")
	.setTimestamp()

  message.channel.send(embed);
}

function noBookEmbed(message){
  const embed = new Discord.MessageEmbed()
	.setColor("#FF0000")
  .setTitle("Error Adding Book")
	.setDescription("Please Specify The Title, Author Name And Put (FI) Or (NF) At The End To Specify Whether Your Book Is Fiction Or Not\n**Example:**```\n;addbook example by example (NF)```")
	.setTimestamp()

  message.channel.send(embed);
}



bot.on('message', async message => {
  // Check for command
  
  if (message.content.startsWith(config.prefix)) {
    let args = message.content.slice(config.prefix.length).split(' ');
    let command = args.shift().toLowerCase();

    if(message.channel.id != "829092072664465428"){
      wrongChannelEmbed(message)
      command = ""
    }
    switch (command) {
      case 'leaderboard':
        showLeaderboard(message)
        break
     /* case 'day':
        addDay()
        break*/
      
      case 'current':
        searchID = message.author;
        if(args.length > 0)
          searchID = message.mentions.users.first()
        db.get(searchID.id).then(value => {
          if(value){
            readingDataEmbed(message,value[0],searchID)
          }
          else{
            if(!args.length > 0){
              db.set(message.author.id, [[0],[""],[1,0]]).then(() => {
                accountMadeEmbed(message)
              });
            }
            else{
              noAccount(message)
            }
          }
        })
        break;

      case 'addbook':
        if(args.length < 1 && args.join(' ') <= 4){
          noBookEmbed(message)
          break
        }

        let category = args.join(' ').substring(args.join(' ').length-4, args.join(' ').length)
        let byAmount = (args.join(' ').match(/ by/g))

        if(byAmount == null){
          noBookEmbed(message)
          break
        }

        if((category != '(NF)' && category != '(FI)') || (byAmount.length != 1)){
          noBookEmbed(message)
          break
        }
        
        db.get(message.author.id).then(value => {
          if(value){
            
            let newArray = value[1].concat([""])
            newArray[newArray.length-1] += args.join(' ')
            newValue = [value[0],newArray,value[2]]

            db.set(message.author.id, newValue);
            addedBookEmbed(message, args.join(' '))
          }
          else{
            db.set(message.author.id, [[0],[""],[1,0]]).then(() => {
              accountMadeEmbed(message)
            });
          }
        });
        break
      
      case 'removebook':

        db.get(message.author.id).then(value => {
          if(value && value[1].length > 1){
            let newArray = value[1]
            newArray.pop()
            newValue = [value[0],newArray,value[2]]
            db.set(message.author.id, newValue);
            removeBookEmbed(message)
          }
          else if(!value){
            db.set(message.author.id, [[0],[""],[1,0]]).then(() => {
              accountMadeEmbed(message)
            });
          }
          else{
            const embed = new Discord.MessageEmbed()
          .setColor("#FF0000")
          .setTitle(`You Don't Have Any Books To Remove`)
          .setTimestamp()

          message.channel.send(embed);
          }
        });
        break


      case 'account':
        searchID = message.author;
        if(args.length > 0)
          searchID = message.mentions.users.first()
        db.get(searchID.id).then(value => {
          if(value){
            let library = ""
            for(let i = 1; i < value[1].length; i++){
              
              let bookName = value[1][i].replace(/\*/g,"")
                .replace(/\`/g,"")
              
              bookName = "*"+bookName.replace(" by","* by")
              
              library += (`\n${bookName}`)
            }
            
            const embed = new Discord.MessageEmbed()
            
              .setColor("#00FF00")
              .setTitle(searchID.username+"'s Account")
              .setDescription(searchID.username + ", has read **" + value[2][1] + " pomodoros** throught **" + value[2][0] + " days** ", message, searchID)
              .setThumbnail(searchID.avatarURL())
              .setTimestamp()
              .addField('Library:',`${library.length > 0 ? library: "No Books"}` ,true)
              .addFields(
                { name: 'Days:', value: value[2][0], inline: true},
                { name: 'Pomodori:', value: value[2][1], inline: true },
                { name: 'Reading Rate:', value: (value[2][1]/value[2][0]).toFixed(2) +' per day', inline: true },
              )
              message.channel.send(embed);
              
              
          }
          else{
            if(!args.length > 0){
              db.set(message.author.id, [[0],[""],[1,0]]).then(() => {
                accountMadeEmbed(message)
              });
            }
            else{
              noAccount(message)
            }
            
          }
        });
        break;

      case 'add':
        db.get(message.author.id).then(value => {
          if(value){
            let newArray = value[0]
            newArray[newArray.length-1] +=1
            let newArrayTwo = value[2]
            newArrayTwo[1] += 1
            newValue = [newArray,value[1],newArrayTwo]
            db.set(message.author.id, newValue);
            addedPomodoroEmbed(message)

            addRank(message, value[2][1]);
            addBadge(message, value[0].reduce(reducer)/value[0].length);
          
          }
          else{
            db.set(message.author.id, [[0],[""],[1,0]]).then(() => {
              accountMadeEmbed(message)
            });
          }
        });
        break


      /* Unless you know what you're doing, don't change this command. */
      case 'help':
        let embed =  new MessageEmbed()
          .setTitle('HELP MENU')
          .setColor('GREEN')
          .setFooter(`Requested by: ${message.member ? message.member.displayName : message.author.username}`, message.author.displayAvatarURL())
          .setThumbnail(bot.user.displayAvatarURL());
        if (!args[0])
          embed
            .setDescription(Object.keys(commands).map(command => `\`${command.padEnd(Object.keys(commands).reduce((a, b) => b.length > a.length ? b : a, '').length)}\` :: ${commands[command].description}`).join('\n'));
        else {
          if (Object.keys(commands).includes(args[0].toLowerCase()) || Object.keys(commands).map(c => commands[c].aliases || []).flat().includes(args[0].toLowerCase())) {
            let command = Object.keys(commands).includes(args[0].toLowerCase())? args[0].toLowerCase() : Object.keys(commands).find(c => commands[c].aliases && commands[c].aliases.includes(args[0].toLowerCase()));
            embed
              .setTitle(`COMMAND - ${command}`)

            if (commands[command].aliases)
              embed.addField('Command aliases', `\`${commands[command].aliases.join('`, `')}\``);
            embed
              .addField('DESCRIPTION', commands[command].description)
              .addField('FORMAT', `\`\`\`${config.prefix}${commands[command].format}\`\`\``);
          } else {
            embed
              .setColor('RED')
              .setDescription('This command does not exist. Please use the help command without specifying any commands to list them all.');
          }
        }
        message.channel.send(embed);
        break;
    }
  }
});


require('./server')();
bot.login(config.token);
