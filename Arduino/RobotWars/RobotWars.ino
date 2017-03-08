//#include <WString.h>
//String readRequest;

const byte backInputIR = A1; //IR receiver
const byte frontInputIR = A0; //IR receiver
const byte outputIR = 13; //IR transmitter

const byte EN = 10;  //pin 6 L295N ENABLE A 
const byte IN1 = 8;  //pin 5 L295N IN1
const byte IN2 = 12;  //pin 7 L295N IN2

const byte ENB = 6; //pin 11 L295N ENABLE B
const byte IN3 = 9; //pin 10 L295N IN3
const byte IN4 = 7; //pin 12 L295N IN4

void setup()  
{  
  
  pinMode(EN,OUTPUT);
  pinMode(IN1,OUTPUT);
  pinMode(IN2,OUTPUT);

  
  pinMode(ENB,OUTPUT);
  pinMode(IN3,OUTPUT);
  pinMode(IN4,OUTPUT);

  pinMode(frontInputIR, INPUT_PULLUP);
  pinMode(backInputIR, INPUT_PULLUP);
  pinMode(outputIR, OUTPUT);
  
  Serial.begin(9600);  //local Serial Monitor
  Serial1.begin(9600);  //bluetooth Serial Monitor

    //set speed
  analogWrite(EN,255);
  analogWrite(ENB,255);

  //interrupt for IR sensors
  attachInterrupt(backInputIR, readIRSensor, FALLING);
  attachInterrupt(frontInputIR, readIRSensor, FALLING);
  
}  
  
void loop()  
{  
 /*   Serial.println(digitalRead(frontInputIR));
  Serial.println(digitalRead(backInputIR));*/
   // Keep reading from HC-05 and send to Arduino Serial Monitor  
  if (Serial1.available())
  {
    char readCommand = Serial1.read();
   // Serial.println("Finished reading request: " + readCommand);
    handleCommand(readCommand);
  }
}  

void handleCommand(char command)
{
  //drive
  if(command == 'd')
  {
    forward();
  }

  //back
  if(command == 'b')
  {
    backwards();
  }

  //left
  if(command == 'l')
  {
    left();
  }

  //right
  if(command == 'r')
  {
    right();
  }

  //stop
  if(command == 's')
  {
    stopMotor();
  }

  //fire
  if(command == 'f')
  {
    fireIRSensor();
  }
}


void forward()
{
  //Serial1.println("Going forward!");
  //forward right
  digitalWrite(IN1,LOW);
  digitalWrite(IN2,HIGH);
  //forward left
  digitalWrite(IN3,LOW);
  digitalWrite(IN4,HIGH);
}

void backwards()
{
  //Serial1.println("Going backwards!");
  
  //back left
  digitalWrite(IN3,HIGH);
  digitalWrite(IN4,LOW);

 //back right
  digitalWrite(IN1,HIGH);
  digitalWrite(IN2,LOW);  
}

void left()
{
  //Serial1.println("Going left!");

  //forward left
  digitalWrite(IN3,HIGH);
  digitalWrite(IN4,LOW);

 //back right
  digitalWrite(IN1,LOW);
  digitalWrite(IN2,HIGH);  
}

void right()
{  
  //Serial1.println("Going right!");
  //back left
  digitalWrite(IN3,LOW);
  digitalWrite(IN4,HIGH);

 //forward right
  digitalWrite(IN1,HIGH);
  digitalWrite(IN2,LOW); 
}

void stopMotor()
{
  //Serial1.println("Stop motors!");

  digitalWrite(IN1,LOW);
  digitalWrite(IN2,LOW);

  digitalWrite(IN3,LOW);
  digitalWrite(IN4,LOW);

}

void readIRSensor()
{
 // Serial.println(analogRead(frontInputIR));
 // Serial.println(analogRead(backInputIR));
 
  if(analogRead(frontInputIR) < 10 || analogRead(backInputIR) < 10)
  {
    Serial1.println("HIT");
  }
}

void fireIRSensor()
{
  //Serial1.println("FIRE!!");

  digitalWrite(outputIR, HIGH);
  delay(100);
  digitalWrite(outputIR, LOW);
  delay(100);
}
