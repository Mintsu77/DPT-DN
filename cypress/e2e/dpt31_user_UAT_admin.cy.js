describe('ใบนำส่ง', () => {
  it('Test all provinces in Thailand', () => {
    // เริ่มกระบวนการทดสอบ
    cy.visit("https://dpt31-backoffice.finema.dev/tst-backoffice/")
      .wait(2500);

    cy.contains('button', 'เข้าสู่ระบบ / ลงทะเบียน')
      .should('be.visible')
      .should('not.be.disabled')
      .click()
      .wait(2500);

    cy.origin('https://sso.dpt.go.th', () => {
      cy.get('#signUsername').type('dpt0747');
      cy.get('#signPassword').type('1234Sso@');
      cy.get('#btn-submit').click();
    });

    cy.get('.mt-4 > [href="/tst-backoffice/waybill"]', { timeout: 10000 })
      .should('exist')
      .click();

    // ทำวนลูปแบบ async-safe ด้วย recursion
    const fillForm = (round = 0) => {
      if (round >= 2) return;

      cy.log(`📝 กำลังดำเนินการรอบที่ ${round + 1}`);

      cy.fixture('api_province_with_amphure_tambon.json').then((provinces) => {
        const randomProvince = provinces[Math.floor(Math.random() * provinces.length)];
        const amphureList = randomProvince.amphure;
        const randomAmphure = amphureList[Math.floor(Math.random() * amphureList.length)];
        const tambonList = randomAmphure.tambon;
        const randomTambon = tambonList[Math.floor(Math.random() * tambonList.length)];

        const location = {
          province: randomProvince.name_th,
          amphure: randomAmphure.name_th,
          district: randomTambon.name_th
        };

        cy.fixture('work_types.json').then((typeData) => {
          //const totalTypes = typeData.workTypes.length;//
          const workTypeIndex = Math.floor(Math.random() * typeData.workTypes.length);
          const workTypes = typeData.workTypes[workTypeIndex];

         //ดึงข้อมูลประเภทการทดสอบ
         cy.fixture('testType.json').then((typeData) => {
          const testTypeIndex = Math.floor(Math.random() * typeData.testTypes.length);
          const testType = typeData.testTypes[testTypeIndex];

        //ดึงข้อมูลชื่อไฟล์อัปโหลด
        cy.fixture('filesName.json').then((fileData) => {
          const matched = fileData.files.find(f => f.testType === testType);
          const fileName = matched ? matched.fileName : 'default.pdf';

        // ดึงข้อมูลชื่อผู้ใช้
        cy.fixture('thai_names_5000.json').then((typeData) => {
          const randomIndex = Math.floor(Math.random() * typeData.firstname.length);
          const senderFirst = typeData.firstname[randomIndex];
          const senderLast = typeData.lastname[randomIndex];


        // ดึงข้อมูลผู้ใช้จาก API
        cy.request('https://randomuser.me/api/').then((response) => {
          const user = response.body.results[0];
          const senderTitleList = ['นาย', 'นางสาว', 'นาง'];
          const senderTitle = senderTitleList[Math.floor(Math.random() * senderTitleList.length)];
          const senderEmail = user.email;

          // ฟังก์ชันสุ่มเลขเบอร์ 10 หลัก
          const generateThaiPhone = () => {
            const prefixes = ['08', '09', '06'];
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const body = Math.floor(10000000 + Math.random() * 89999999).toString();
            return prefix + body;
          };
        
          const senderPhone = generateThaiPhone();
          // ฟังก์ชันสุ่มเลขบัตรประชาชน 13 หลัก
          const generateThaiIdCard = () => {
            const digits = [];
            for (let i = 0; i < 12; i++) {
              digits.push(Math.floor(Math.random() * 10));
            }
          
            // คำนวณ check digit
            const sum = digits.reduce((acc, digit, idx) => acc + digit * (13 - idx), 0);
            const checkDigit = (11 - (sum % 11)) % 10;
            digits.push(checkDigit);
          
            return digits.join('');
          };
          
          const requesterIdCard = generateThaiIdCard();
          // ฟังก์ชันสุ่มที่อยู่
          const randomAddress = `${Math.floor(Math.random() * 999) + 1}/` +
                                `${Math.floor(Math.random() * 20) + 1} หมู่ ${Math.floor(Math.random() * 10) + 1}` +
                                ` ซอย ${Math.floor(Math.random() * 10) + 1}` +
                                ` ถนน ${Math.floor(Math.random() * 10) + 1}`;
        
          // --- เริ่มกรอกฟอร์ม --- 
          cy.log(`เริ่มรอบที่ ${round + 1}`);
          // เลือกศูนย์ทดสอบวัสดุ
          cy.get(':nth-child(2) > .inline-flex').click();
          cy.get('select.w-1\\/2.h-10.rounded-md').select('จังหวัดกำแพงเพชร');
          cy.get('div[role="radio"]').contains('ทดสอบที่ห้องปฏิบัติการของศูนย์ทดสอบ').click({ force: true });
          cy.get('input[placeholder="เลือก"]').click();

          // ข้อมูลผู้นำส่ง
          cy.contains('li', senderTitle).click();
          cy.get("input[placeholder='กรุณากรอกชื่อ']").clear().type(senderFirst);
          cy.get("input[placeholder='กรุณากรอกนามสกุล']").clear().type(senderLast);
          cy.get("input[placeholder='กรุณากรอกอีเมล']").clear().type(senderEmail);
          cy.get("input[placeholder='กรุณากรอกเบอร์โทรศัพท์']").clear().type(senderPhone);

          // กดปุ่มถัดไป
          cy.get('.mt-6 > .text-white', { timeout: 10000 }).should('exist').click();
          cy.wait(2500);

          // ข้อมูลผู้ขอทดสอบ
          cy.get('input[role="combobox"][placeholder="เลือก"]').click();
          cy.contains('li', senderTitle).click();
          cy.get("input[placeholder='กรุณากรอกชื่อ']").clear().type(senderFirst);
          cy.get("input[placeholder='กรุณากรอกนามสกุล']").clear().type(senderLast);
          cy.get("input[placeholder='กรุณากรอกอีเมล']").clear().type(senderEmail);
          cy.get("input[placeholder='กรุณากรอกเลขประจำตัวประชาชน']").clear().type(requesterIdCard);

          // ข้อมูลที่อยู่
          cy.get("input[placeholder='กรุณากรอกที่อยู่']").clear().type(randomAddress);
          cy.get("input[placeholder='กรุณาเลือกจังหวัด']").first().type(`${location.province}{enter}`);
          cy.get("input[placeholder='กรุณาเลือกอำเภอ/เขต']").first().type(`${location.amphure}{enter}`);
          cy.get("input[placeholder='กรุณาเลือกตำบล/แขวง']").first().type(`${location.district}{enter}`);

          // เลือกชื่อโครงการ
          cy.get(':nth-child(5) > .items-start > .inline-flex').click();
          cy.contains('[role="radio"]', 'ข้อมูลโครงการ').click();
          cy.get('input[placeholder="เลือกรายการทดสอบ"]').click();
          cy.get('ul[role="listbox"]').should('be.visible');
          cy.get('ul[role="listbox"] > li').contains('setA_BKK').click();
          cy.get('.modal-footer > .text-white', { timeout: 10000 }).should('exist').click();

          // แนบไฟล์
          cy.get('[data-field="file_upload1"] input[type="file"]')
            .selectFile('cypress/fixtures/A1.jpeg', { force: true })
            .wait(5000);

          cy.get('.mt-6 > .text-white').click(); // Save
          cy.get('.mt-6 > .flex > .text-white').click(); // Confirm
          cy.get('.swal2-confirm', { timeout: 10000 }).should('exist').click()
            .wait(4000);
          
          // เคลียร์ขั้นตอนต่อไป
          cy.get('td').eq(5).find('button').click().wait(4000);
          cy.get('.bg-purple', { timeout: 10000 }).should('exist').click({ force: true });
          cy.get('input[placeholder="กรุณาเลือกกลุ่มงาน"]', { timeout: 15000 }).should('be.visible').click({ force: true });
          cy.get('li').contains('กลุ่มงานวิชาการโยธาธิการ').should('be.visible');
          cy.get('li').contains('กลุ่มงานวิชาการโยธาธิการ').click({ force: true });

          cy.get('input[placeholder="กรุณาเลือกประเภทงาน"]').click({ force: true });
          cy.contains('li', workTypes).first().should('be.visible').click({ force: true })
          cy.get('.justify-end > .text-white', { timeout: 10000 }).should('exist').click({ force: true }).wait(3000);
          
          cy.get('.bg-purple', { timeout: 10000 }).should('exist').click();
          cy.get('button').contains('ยืนยัน', { timeout: 15000 }).should('be.visible').click({ force: true })
            .wait(3000);
          
          cy.contains('ออกใบชำระค่าธรรมเนียม', { timeout: 10000 }).should('exist').click({ force: true })
            .wait(1000);
          cy.contains('ชำระผ่านกรมโยธาธิการและผังเมือง').click()
            .wait(500);
          cy.contains('button', 'บันทึก', { timeout: 10000 }).should('exist').click({ force: true })
            .wait(10000);

          cy.get('button').contains('ยืนยันการชำระค่าธรรมเนียม', { timeout: 10000 }).should('exist').click({ force: true });
          cy.contains('ชำระผ่านเครื่อง EDC').click();
          cy.get('input[placeholder="DD/MM/YYYY"]').click();
            cy.get('.dp__today').click();
            cy.contains('button', 'เลือก').click();
          cy.get('input[placeholder="Select time"]').click();
            cy.get('button[aria-label="Decrement hours"]').click();
          cy.get('input[placeholder="กรอกจำนวนเงิน"]').type('200000')
            .wait(500);
          cy.get('.justify-end > .text-white', { timeout: 10000 }).should('exist').click();

          cy.contains('div[role="radio"]', 'ดำเนินการทดสอบในระบบ').click();
          cy.contains('button', 'บันทึกผลทดสอบ').click()
          .wait(2500);
          cy.get('.mb-4 > .inline-flex')
          .wait(2500).click()

          cy.get('input[placeholder="กรุณาเลือกเอกสารทดสอบที่ใช้"]', { timeout: 10000 }).should('be.visible').click();
          cy.get('ul[role="listbox"] [role="option"]').contains(testType).click();
          cy.get('input#uploadFile_documents').attachFile(fileName)
          .wait(2500);


          cy.get(':nth-child(2) > .group > .border-gray-60').click();
          cy.get(':nth-child(3) > .group > .border-gray-60').click();
          cy.get(':nth-child(4) > .group > .border-gray-60').click();
          cy.get(':nth-child(5) > .group > .border-gray-60').click();
          cy.get(':nth-child(6) > .group > .border-gray-60').click();
          cy.contains('button', 'บันทึกข้อมูล').click();
          cy.get('#headlessui-combobox-input-98').click();
          cy.get('ul[role="listbox"] [role="option"]')
            .contains('การทดสอบคอนกรีต')
            .click();
          cy.get('.justify-end > .text-white').click()
            .wait(2500);
          cy.contains('button', 'กลับ', { timeout: 10000 }).should('exist').click()
            .wait(1500);

          cy.contains('button', 'กลับ', { timeout: 10000 }).should('exist').click();
            cy.wait(2000).then(() => {

          fillForm(round + 1); // เรียกตัวเองสำหรับรอบถัดไป
         });
       });
      });
     });
    });
   });
  });
 };

    // เริ่มทำงานรอบแรก
    fillForm();
  });
});
