const byte backInputIR = A1; //IR receiver
const byte frontInputIR = A0; //IR receiver
const byte irTransmitter = 13; //IR transmitter

const byte EN = 10;  //pin 6 L295N ENABLE A 
const byte IN1 = 8;  //pin 5 L295N IN1
const byte IN2 = 12;  //pin 7 L295N IN2

const byte ENB = 6; //pin 11 L295N ENABLE B
const byte IN3 = 9; //pin 10 L295N IN3
const byte IN4 = 7; //pin 12 L295N IN4

unsigned long previousMillis = 0;        
const long interval = 1000;

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
  pinMode(irTransmitter, OUTPUT);
  
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
     char c = Serial1.read();
        Serial.print(c);
        switch(c)
        {
          case 'b':
            drive(HIGH);
          break;
  
          case 's':
            stopMotor();
          break;
  
          case 'd':
            drive(LOW);
          break;

          case 'l':
            turn(LOW);
          break;

          case 'r':
            turn(HIGH);
          break;

          case 'g':
            turn(2);
          break;

          case 'f':
            fireIRSensor();
          break;
        }
  }
}

void drive(uint8_t directionMotor)
{
  digitalWrite(IN1,LOW);
  digitalWrite(IN2,LOW);
  switch(directionMotor)
  {
    case 0:
      digitalWrite(IN1,LOW);
      digitalWrite(IN2,HIGH);

      digitalWrite(IN3,LOW);
      digitalWrite(IN4,HIGH);
      
    break;
    
    case 1:
      digitalWrite(IN1,HIGH);
      digitalWrite(IN2,LOW);
      
      digitalWrite(IN3,HIGH);
      digitalWrite(IN4,LOW);
    break;
  }
}

void turn(uint8_t directionMotor)
{    
  switch(directionMotor)
  {
    case 0:

      digitalWrite(IN1,LOW);
      digitalWrite(IN2,HIGH);
      
      digitalWrite(IN3,HIGH);
      digitalWrite(IN4,LOW);
      
    break;
    
    case 1:
      digitalWrite(IN1,HIGH);
      digitalWrite(IN2,LOW);
      
      digitalWrite(IN3,LOW);
      digitalWrite(IN4,HIGH);
    break;

    default:
      digitalWrite(IN1,LOW);
      digitalWrite(IN2,LOW);
      digitalWrite(IN3,LOW);
      digitalWrite(IN4,LOW);
    break;
  }
}


void stopMotor()
{
  digitalWrite(IN1,LOW);
  digitalWrite(IN2,LOW);  
  digitalWrite(IN3,LOW);
  digitalWrite(IN4,LOW);  
}


void readIRSensor()
{
  
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) 
  {
    previousMillis = currentMillis;
    Serial1.println("HIT");
  }
} 

void fireIRSensor()
{
  previousMillis = millis();
  digitalWrite(irTransmitter, HIGH);
  delay(200);
  digitalWrite(irTransmitter, LOW);
  delay(200);
}
