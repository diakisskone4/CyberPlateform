import os
import sys
import django

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cyberwta_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from courses.models import Certification, Module, Chapter, Video
from payments.models import PaymentProof, Enrollment
from learning.models import VideoProgress, Quiz, Question, Choice, QuizAttempt
from certificates.models import Certificate
from interactions.models import LessonComment, Notification, AuditLog

User = get_user_model()

def run_seed():
    print("🚀 Initialisation des données de test Cyber WTA...")

    # 1. Create Users
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@cyberwta.com',
            'first_name': 'Dr. Mamadou',
            'last_name': 'Diakité',
            'role': User.Role.ADMIN,
            'phone_number': '+223 72 61 92 78',
            'is_staff': True,
            'is_superuser': True,
            'bio': 'Directeur Pédagogique & Expert en Cybersécurité Certifié CISSP / CISM.'
        }
    )
    admin_user.set_password('Admin1234!')
    admin_user.save()

    trainer_user, _ = User.objects.get_or_create(
        username='trainer',
        defaults={
            'email': 'trainer@cyberwta.com',
            'first_name': 'Ousmane',
            'last_name': 'Traoré',
            'role': User.Role.INSTRUCTOR,
            'phone_number': '+223 70 11 22 33',
            'bio': 'Lead Penetration Tester & Instructeur Red Team chez Cyber WTA.'
        }
    )
    trainer_user.set_password('Trainer1234!')
    trainer_user.save()

    student_user, _ = User.objects.get_or_create(
        username='student',
        defaults={
            'email': 'student@cyberwta.com',
            'first_name': 'Aïssata',
            'last_name': 'Coulibaly',
            'role': User.Role.STUDENT,
            'phone_number': '+223 76 54 32 10',
            'bio': 'Étudiante passionnée par l\'analyse des incidents et la défense réseau.'
        }
    )
    student_user.set_password('Student1234!')
    student_user.save()

    student2_user, _ = User.objects.get_or_create(
        username='student2',
        defaults={
            'email': 'student2@cyberwta.com',
            'first_name': 'Ibrahim',
            'last_name': 'Keita',
            'role': User.Role.STUDENT,
            'phone_number': '+223 78 90 12 34',
            'bio': 'Administrateur systèmes en reconversion vers la cybersécurité offensive.'
        }
    )
    student2_user.set_password('Student1234!')
    student2_user.save()

    print("✓ Utilisateurs créés : admin@cyberwta.com, trainer@cyberwta.com, student@cyberwta.com, student2@cyberwta.com (MDP: Admin1234! / Trainer1234! / Student1234!)")

    # High quality cyber video samples (using stable direct HLS / MP4 streaming samples)
    DEMO_VIDEOS = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    ]

    # 2. Certification 1 : Analyste SOC & Détection d'Intrusions
    cert_soc, _ = Certification.objects.get_or_create(
        title="Analyste SOC & Détection d'Intrusions",
        defaults={
            'slug': 'analyste-soc-defense-operationnelle',
            'short_description': "Maîtrisez la surveillance des réseaux, l'analyse SIEM et la réponse aux incidents de sécurité.",
            'description': """Cette certification professionnelle d'Analyste SOC (Security Operations Center) vous prépare à intervenir en première et deuxième ligne de défense contre les cyberattaques. 
Vous apprendrez à analyser les flux réseau, corréler les événements de sécurité avec Wazuh et Splunk, qualifier les alertes de menace et appliquer le cycle de réponse à incident PICERL.""",
            'level': Certification.Level.INTERMEDIATE,
            'estimated_hours': 35,
            'price': 35000,
            'thumbnail': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
            'prerequisites': 'Connaissances de base des protocoles TCP/IP et de l\'administration Linux/Windows.',
            'learning_outcomes': """- Comprendre l'architecture et les rôles d'un SOC moderne\n- Collecter, normaliser et analyser des logs multi-sources\n- Configurer des règles de détection SIEM et repérer les attaques de type Brute-force et Lateral Movement\n- Mener une analyse de compromission et isoler les postes infectés""",
            'badge_name': 'Certified SOC Analyst (CSA-WTA)',
            'is_published': True
        }
    )

    # Module 1 SOC
    mod_soc_1, _ = Module.objects.get_or_create(
        certification=cert_soc,
        title="Architecture SIEM & Détection des Menaces",
        defaults={'order': 1, 'price': 15000, 'description': "Découverte des architectures SIEM et normalisation des flux de journaux d'événements."}
    )
    ch_soc_1, _ = Chapter.objects.get_or_create(
        module=mod_soc_1,
        title="Fondements d'un Security Operations Center (SOC)",
        defaults={'order': 1, 'description': "Rôle des analystes N1, N2 et N3, métriques MTTD / MTTR."}
    )
    # Vidéo 1 (GRATUITE)
    v_soc_1, _ = Video.objects.get_or_create(
        chapter=ch_soc_1,
        title="1. Introduction au métier d'Analyste SOC & Architecture de Défense",
        defaults={
            'order': 1,
            'video_url': DEMO_VIDEOS[0],
            'duration_seconds': 480,
            'is_free_override': True,
            'resources_notes': "Téléchargez le guide méthodologique : Guide_Analyste_SOC_WTA.pdf\nPoints clés : Niveaux de maturité, outils EDR/SIEM."
        }
    )
    # Vidéo 2 (GRATUITE)
    v_soc_2, _ = Video.objects.get_or_create(
        chapter=ch_soc_1,
        title="2. Centralisation et Corrélation des Logs dans un SIEM",
        defaults={
            'order': 2,
            'video_url': DEMO_VIDEOS[1],
            'duration_seconds': 620,
            'is_free_override': False,
            'resources_notes': "Étude de cas : Journaux Syslog et Windows Event Forwarding (WEF Event ID 4624, 4625)."
        }
    )
    # Vidéo 3 (PAYANTE 🔒)
    v_soc_3, _ = Video.objects.get_or_create(
        chapter=ch_soc_1,
        title="3. Configuration Avancée des Règles de Détection Wazuh & Splunk",
        defaults={
            'order': 3,
            'video_url': DEMO_VIDEOS[2],
            'duration_seconds': 750,
            'is_free_override': False,
            'resources_notes': "Script de simulation d'attaque Brute-Force SSH et création de la règle de détection XML."
        }
    )

    # Quiz Module 1 SOC
    quiz_soc_1, _ = Quiz.objects.get_or_create(
        module=mod_soc_1,
        title="Évaluation Module 1 : Détection & Corrélation SIEM",
        defaults={
            'quiz_type': Quiz.QuizType.MODULE_QUIZ,
            'certification': cert_soc,
            'pass_percentage': 75,
            'time_limit_minutes': 15,
            'description': "Vérifiez vos acquis sur le rôle du SOC, l'analyse des Event IDs Windows et le fonctionnement d'un SIEM."
        }
    )
    # Questions Quiz SOC 1
    q1, _ = Question.objects.get_or_create(
        quiz=quiz_soc_1,
        order=1,
        defaults={
            'text': "Quel Event ID Windows correspond à un échec d'authentification (Logon Failure) souvent indicateur d'une attaque par force brute ?",
            'points': 1,
            'explanation': "L'Event ID 4624 indique une connexion réussie, tandis que l'Event ID 4625 enregistre chaque tentative d'authentification échouée."
        }
    )
    Choice.objects.get_or_create(question=q1, text="Event ID 4624", defaults={'is_correct': False})
    Choice.objects.get_or_create(question=q1, text="Event ID 4625", defaults={'is_correct': True})
    Choice.objects.get_or_create(question=q1, text="Event ID 7045", defaults={'is_correct': False})
    Choice.objects.get_or_create(question=q1, text="Event ID 1102", defaults={'is_correct': False})

    q2, _ = Question.objects.get_or_create(
        quiz=quiz_soc_1,
        order=2,
        defaults={
            'text': "Que signifie l'acronyme SIEM en cybersécurité ?",
            'points': 1,
            'explanation': "SIEM signifie Security Information and Event Management, combinant gestion des informations et gestion des événements de sécurité."
        }
    )
    Choice.objects.get_or_create(question=q2, text="System Internal Endpoint Monitoring", defaults={'is_correct': False})
    Choice.objects.get_or_create(question=q2, text="Security Information and Event Management", defaults={'is_correct': True})
    Choice.objects.get_or_create(question=q2, text="Secure Internet Encryption Module", defaults={'is_correct': False})

    q3, _ = Question.objects.get_or_create(
        quiz=quiz_soc_1,
        order=3,
        defaults={
            'text': "Quelle est la métrique clé mesurant le temps moyen nécessaire pour détecter une intrusion (Mean Time To Detect) ?",
            'points': 1,
            'explanation': "MTTD = Mean Time To Detect (temps moyen de détection). MTTR = Mean Time To Remediate (temps moyen de remédiation)."
        }
    )
    Choice.objects.get_or_create(question=q3, text="MTTD", defaults={'is_correct': True})
    Choice.objects.get_or_create(question=q3, text="MTTR", defaults={'is_correct': False})
    Choice.objects.get_or_create(question=q3, text="RPO", defaults={'is_correct': False})

    # Module 2 SOC
    mod_soc_2, _ = Module.objects.get_or_create(
        certification=cert_soc,
        title="Analyse Forensique et Réponse à Incident",
        defaults={'order': 2, 'price': 20000, 'description': "Méthodologie de réponse aux incidents de sécurité et investigations numériques."}
    )
    ch_soc_2, _ = Chapter.objects.get_or_create(
        module=mod_soc_2,
        title="Investigation Numérique & Endiguement",
        defaults={'order': 1, 'description': "Collecte d'artefacts mémoire et isolation réseau."}
    )
    # Vidéo 1 (GRATUITE)
    Video.objects.get_or_create(
        chapter=ch_soc_2,
        title="1. Les 6 Phases du Cycle de Réponse à Incident (PICERL)",
        defaults={'order': 1, 'video_url': DEMO_VIDEOS[3], 'duration_seconds': 540, 'is_free_override': True}
    )
    # Vidéo 2 (GRATUITE)
    Video.objects.get_or_create(
        chapter=ch_soc_2,
        title="2. Extraction et Analyse de la Mémoire Vive avec Volatility 3",
        defaults={'order': 2, 'video_url': DEMO_VIDEOS[4], 'duration_seconds': 680, 'is_free_override': False}
    )
    # Vidéo 3 (PAYANTE 🔒)
    Video.objects.get_or_create(
        chapter=ch_soc_2,
        title="3. Neutralisation d'une Attaque par Ransomware et Rétablissement",
        defaults={'order': 3, 'video_url': DEMO_VIDEOS[5], 'duration_seconds': 820, 'is_free_override': False}
    )

    # Examen Final SOC
    exam_soc, _ = Quiz.objects.get_or_create(
        certification=cert_soc,
        title="Examen Final : Certification Analyste SOC Professionnel",
        defaults={
            'quiz_type': Quiz.QuizType.FINAL_EXAM,
            'pass_percentage': 80,
            'time_limit_minutes': 30,
            'description': "Examen complet certifiant les compétences opérationnelles d'Analyste SOC de Cyber WTA. Score minimal de réussite : 80%."
        }
    )
    eq1, _ = Question.objects.get_or_create(
        quiz=exam_soc,
        order=1,
        defaults={'text': "Dans le cycle PICERL de l'ANSSI / SANS, quelle étape suit immédiatement l'Identification de la menace ?", 'points': 2, 'explanation': "L'ordre PICERL est : Préparation, Identification, Confinement (Endiguement), Éradication, Recouvrement, Leçons apprises."}
    )
    Choice.objects.get_or_create(question=eq1, text="Confinement / Endiguement", defaults={'is_correct': True})
    Choice.objects.get_or_create(question=eq1, text="Éradication", defaults={'is_correct': False})
    Choice.objects.get_or_create(question=eq1, text="Restauration", defaults={'is_correct': False})

    eq2, _ = Question.objects.get_or_create(
        quiz=exam_soc,
        order=2,
        defaults={'text': "Quel artefact Windows permet d'analyser l'historique d'exécution des binaires pour prouver le lancement d'un malware ?", 'points': 2, 'explanation': "Les fichiers Prefetch (.pf) et la base Shimcache / Amcache enregistrent l'exécution des programmes."}
    )
    Choice.objects.get_or_create(question=eq2, text="Fichiers Prefetch (.pf) & Amcache", defaults={'is_correct': True})
    Choice.objects.get_or_create(question=eq2, text="Fichier hosts", defaults={'is_correct': False})
    Choice.objects.get_or_create(question=eq2, text="Table ARP", defaults={'is_correct': False})

    # 3. Certification 2 : Hacking Éthique & Tests d'Intrusion
    cert_pentest, _ = Certification.objects.get_or_create(
        title="Hacking Éthique & Tests d'Intrusion (Pentest)",
        defaults={
            'slug': 'hacking-ethique-pentest-avance',
            'short_description': "Apprenez à penser comme un attaquant pour sécuriser les systèmes, réseaux et applications web.",
            'description': """Cette formation offensive de haut niveau vous enseigne la méthodologie rigoureuse des tests d'intrusion professionnels (norme PTES). 
Vous apprendrez à réaliser une reconnaissance passive et active (OSINT, Nmap), exploiter les vulnérabilités de services distants, pénétrer des applications web (OWASP Top 10) et élever vos privilèges vers les droits root/SYSTEM.""",
            'level': Certification.Level.ADVANCED,
            'estimated_hours': 45,
            'price': 50000,
            'thumbnail': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
            'prerequisites': 'Solides connaissances en réseaux, Linux, bash scripting et bases du développement web.',
            'learning_outcomes': """- Réaliser un audit de vulnérabilités selon le standard PTES\n- Maîtriser Kali Linux, Nmap, Burp Suite et Metasploit Framework\n- Exploiter les failles SQLi, XSS, CSRF, SSRF et désérialisation non sécurisée\n- Rédiger un rapport de pentest professionnel conforme aux exigences des directions d'entreprise""",
            'badge_name': 'Certified Ethical Pentester (CEP-WTA)',
            'is_published': True
        }
    )

    mod_pen_1, _ = Module.objects.get_or_create(
        certification=cert_pentest,
        title="Reconnaissance Active & Scanning de Vulnérabilités",
        defaults={'order': 1, 'price': 25000, 'description': "Cartographie de la surface d'attaque et identification des failles exploitables."}
    )
    ch_pen_1, _ = Chapter.objects.get_or_create(
        module=mod_pen_1,
        title="Méthodologie PTES et Balayage Réseau",
        defaults={'order': 1}
    )
    # Vidéo 1 (GRATUITE)
    Video.objects.get_or_create(
        chapter=ch_pen_1,
        title="1. Cadre Légal du Hacking Éthique et Ordre de Mission",
        defaults={'order': 1, 'video_url': DEMO_VIDEOS[0], 'duration_seconds': 510, 'is_free_override': True}
    )
    # Vidéo 2 (GRATUITE)
    Video.objects.get_or_create(
        chapter=ch_pen_1,
        title="2. Cartographie d'Infrastructure avec Nmap & Scripts NSE Avancés",
        defaults={'order': 2, 'video_url': DEMO_VIDEOS[1], 'duration_seconds': 700, 'is_free_override': False}
    )
    # Vidéo 3 (PAYANTE 🔒)
    Video.objects.get_or_create(
        chapter=ch_pen_1,
        title="3. Exploitation et Armement d'Exploits avec Metasploit Framework",
        defaults={'order': 3, 'video_url': DEMO_VIDEOS[2], 'duration_seconds': 890, 'is_free_override': False}
    )

    # 4. Certification 3 : Fondamentaux de la Cybersécurité
    cert_fund, _ = Certification.objects.get_or_create(
        title="Fondamentaux de la Cybersécurité & Hygiène Numérique",
        defaults={
            'slug': 'fondamentaux-cybersecurite-hygiene-numerique',
            'short_description': "Les bases incontournables pour protéger ses comptes, données sensibles et équipements.",
            'description': """Accessible à tous les profils, ce programme complet pose les piliers indispensables de la sécurité informatique : 
reconnaître les courriels d'ingénierie sociale, appliquer une politique de mots de passe robuste, chiffrer ses communications et naviguer en toute sécurité.""",
            'level': Certification.Level.BEGINNER,
            'estimated_hours': 15,
            'price': 20000,
            'thumbnail': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
            'prerequisites': 'Aucun prérequis technique nécessaire.',
            'learning_outcomes': """- Identifier immédiatement les techniques d'hameçonnage (Phishing, Smishing, Spear-phishing)\n- Configurer l'authentification multifacteur (MFA) avec clés de sécurité et applications TOTP\n- Sécuriser ses connexions Wi-Fi et utiliser un VPN à bon escient""",
            'badge_name': 'Cyber Hygiene Specialist (CHS-WTA)',
            'is_published': True
        }
    )

    mod_fund_1, _ = Module.objects.get_or_create(
        certification=cert_fund,
        title="Menaces Courantes, Phishing et Ingénierie Sociale",
        defaults={'order': 1, 'price': 10000, 'description': "Identifier et contrer les attaques visant le maillon humain."}
    )
    ch_fund_1, _ = Chapter.objects.get_or_create(
        module=mod_fund_1,
        title="L'Ingénierie Sociale au Quotidien",
        defaults={'order': 1}
    )
    v_fund_1, _ = Video.objects.get_or_create(
        chapter=ch_fund_1,
        title="1. Panorama des Cybermenaces en Afrique de l'Ouest en 2026",
        defaults={'order': 1, 'video_url': DEMO_VIDEOS[3], 'duration_seconds': 420, 'is_free_override': True}
    )
    v_fund_2, _ = Video.objects.get_or_create(
        chapter=ch_fund_1,
        title="2. Anatomie d'un Email de Phishing et Analyse des En-têtes",
        defaults={'order': 2, 'video_url': DEMO_VIDEOS[4], 'duration_seconds': 530, 'is_free_override': False}
    )
    v_fund_3, _ = Video.objects.get_or_create(
        chapter=ch_fund_1,
        title="3. Gestionnaires de Mots de Passe & Double Facteur MFA",
        defaults={'order': 3, 'video_url': DEMO_VIDEOS[5], 'duration_seconds': 610, 'is_free_override': False}
    )

    # Quiz Fondamentaux
    quiz_fund, _ = Quiz.objects.get_or_create(
        module=mod_fund_1,
        title="Quiz : Détection du Phishing & Sécurité des Comptes",
        defaults={
            'quiz_type': Quiz.QuizType.MODULE_QUIZ,
            'certification': cert_fund,
            'pass_percentage': 70,
            'time_limit_minutes': 10,
            'description': "Testez vos réflexes face aux tentatives d'escroquerie et d'hameçonnage."
        }
    )
    fq1, _ = Question.objects.get_or_create(
        quiz=quiz_fund,
        order=1,
        defaults={'text': "Laquelle de ces méthodes de double facteur (2FA/MFA) offre le niveau de sécurité le plus élevé ?", 'points': 1, 'explanation': "Les clés matérielles FIDO2/WebAuthn et les applications d'authentification TOTP sont protégées contre les attaques de SIM Swapping, contrairement aux SMS."}
    )
    Choice.objects.get_or_create(question=fq1, text="Application TOTP / Clé de sécurité FIDO2", defaults={'is_correct': True})
    Choice.objects.get_or_create(question=fq1, text="Code de validation reçu par SMS", defaults={'is_correct': False})
    Choice.objects.get_or_create(question=fq1, text="Email de confirmation", defaults={'is_correct': False})

    fq2, _ = Question.objects.get_or_create(
        quiz=quiz_fund,
        order=2,
        defaults={'text': "Que devez-vous vérifier en priorité dans l'URL d'un site bancaire ou de paiement en ligne ?", 'points': 1, 'explanation': "Vérifiez scrupuleusement le nom de domaine exact (ex: orangemoney.com et non 0rangemoney-mali.com) ainsi que le certificat HTTPS."}
    )
    Choice.objects.get_or_create(question=fq2, text="L'orthographe exacte du nom de domaine", defaults={'is_correct': True})
    Choice.objects.get_or_create(question=fq2, text="La présence de couleurs attrayantes", defaults={'is_correct': False})
    Choice.objects.get_or_create(question=fq2, text="La rapidité de chargement de la page", defaults={'is_correct': False})

    # Examen final Fondamentaux
    exam_fund, _ = Quiz.objects.get_or_create(
        certification=cert_fund,
        title="Examen Final : Spécialiste en Hygiène Numérique & Cybersécurité",
        defaults={
            'quiz_type': Quiz.QuizType.FINAL_EXAM,
            'pass_percentage': 75,
            'time_limit_minutes': 20,
            'description': "Examen final certifiant la maîtrise des bonnes pratiques fondamentales."
        }
    )
    ef1, _ = Question.objects.get_or_create(
        quiz=exam_fund,
        order=1,
        defaults={'text': "Quelle est la règle d'or lors de la réception d'un lien suspect prétendant bloquer votre compte Orange Money ?", 'points': 1, 'explanation': "Ne jamais cliquer sur un lien reçu par SMS ou message non sollicité. Accédez directement à l'application officielle."}
    )
    Choice.objects.get_or_create(question=ef1, text="Ne pas cliquer sur le lien et vérifier via les canaux officiels", defaults={'is_correct': True})
    Choice.objects.get_or_create(question=ef1, text="Cliquer immédiatement pour débloquer le compte", defaults={'is_correct': False})

    print("✓ Certifications créées : SOC Analyst, Pentest, Fondamentaux (avec modules, chapitres, vidéos gratuites/payantes et quiz)")

    # 5. Enrollments & Payment Proofs Demonstration
    # A) Student has validated payment for Certification 3 (Fondamentaux)
    proof_approved, _ = PaymentProof.objects.get_or_create(
        transaction_id="OM260828.1402.C49182",
        defaults={
            'user': student_user,
            'target_type': PaymentProof.TargetType.CERTIFICATION,
            'certification': cert_fund,
            'sender_phone': '+223 76 54 32 10',
            'sender_name': 'Aïssata Coulibaly',
            'amount': 20000,
            'proof_image_url': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
            'status': PaymentProof.Status.APPROVED,
            'admin_notes': 'Paiement Orange Money de 20 000 FCFA vérifié et validé.',
            'reviewed_by': admin_user,
            'reviewed_at': timezone.now()
        }
    )
    Enrollment.objects.get_or_create(
        user=student_user,
        certification=cert_fund,
        defaults={
            'access_type': Enrollment.AccessType.FULL_CERTIFICATION,
            'payment_proof': proof_approved,
            'is_active': True
        }
    )

    # B) Student has completed all videos of Certification 3
    VideoProgress.objects.get_or_create(
        user=student_user,
        video=v_fund_1,
        defaults={'watched_seconds': 420, 'is_completed': True}
    )
    VideoProgress.objects.get_or_create(
        user=student_user,
        video=v_fund_2,
        defaults={'watched_seconds': 530, 'is_completed': True}
    )
    VideoProgress.objects.get_or_create(
        user=student_user,
        video=v_fund_3,
        defaults={'watched_seconds': 610, 'is_completed': True}
    )

    # Passed quizzes for student
    QuizAttempt.objects.get_or_create(
        user=student_user,
        quiz=quiz_fund,
        defaults={'score': 2.0, 'total_points': 2.0, 'percentage': 100.0, 'passed': True}
    )
    QuizAttempt.objects.get_or_create(
        user=student_user,
        quiz=exam_fund,
        defaults={'score': 1.0, 'total_points': 1.0, 'percentage': 100.0, 'passed': True}
    )

    # C) Official Certificate issued to Student
    cert_demo, _ = Certificate.objects.get_or_create(
        certificate_code="CWTA-2026-B4A1-F992",
        defaults={
            'user': student_user,
            'certification': cert_fund,
            'final_score': 95.0,
            'is_revoked': False
        }
    )
    cert_demo.generate_qr_code()
    cert_demo.save()

    # D) Student 2 has a PENDING payment for SOC Module 1 (15 000 FCFA)
    PaymentProof.objects.get_or_create(
        transaction_id="OM260902.9482.B78912",
        defaults={
            'user': student2_user,
            'target_type': PaymentProof.TargetType.MODULE,
            'module': mod_soc_1,
            'sender_phone': '+223 78 90 12 34',
            'sender_name': 'Ibrahim Keita',
            'amount': 15000,
            'proof_image_url': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
            'status': PaymentProof.Status.PENDING,
            'admin_notes': ''
        }
    )

    # E) Sample Rejected payment
    PaymentProof.objects.get_or_create(
        transaction_id="OM260815.1122.X00000",
        defaults={
            'user': student2_user,
            'target_type': PaymentProof.TargetType.CERTIFICATION,
            'certification': cert_pentest,
            'sender_phone': '+223 78 90 12 34',
            'sender_name': 'Ibrahim Keita',
            'amount': 5000,
            'proof_image_url': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
            'status': PaymentProof.Status.REJECTED,
            'admin_notes': 'Montant envoyé (5 000 FCFA) insuffisant pour la certification Pentest (50 000 FCFA).',
            'reviewed_by': admin_user,
            'reviewed_at': timezone.now()
        }
    )

    # F) Sample Lesson Comments
    LessonComment.objects.get_or_create(
        video=v_soc_1,
        user=student_user,
        content="Quelle est la différence concrète entre un analyste N1 et un analyste N2 dans un centre de cyberdéfense ?",
        defaults={}
    )
    parent_c = LessonComment.objects.filter(video=v_soc_1, user=student_user).first()
    if parent_c:
        LessonComment.objects.get_or_create(
            video=v_soc_1,
            user=trainer_user,
            parent=parent_c,
            content="Bonjour Aïssata ! L'analyste N1 effectue le tri initial et filtre les faux positifs. Le N2 prend en charge les alertes qualifiées et mène l'investigation approfondie."
        )

    # G) Sample Notifications
    Notification.objects.get_or_create(
        user=student_user,
        title="Certificat Disponible !",
        defaults={
            'message': f"Félicitations pour votre réussite à la certification '{cert_fund.title}'. Votre certificat vérifiable CWTA-2026-B4A1-F992 est prêt.",
            'notification_type': Notification.Type.CERTIFICATE_ISSUED,
            'link_url': '/certificates',
            'is_read': False
        }
    )
    Notification.objects.get_or_create(
        user=student2_user,
        title="Preuve reçue pour le Module 1 SOC",
        defaults={
            'message': "Votre preuve Orange Money (15 000 FCFA) est en cours d'examen par notre équipe.",
            'notification_type': Notification.Type.INFO,
            'link_url': '/my-courses',
            'is_read': False
        }
    )

    # H) Audit Logs
    AuditLog.objects.get_or_create(
        user=admin_user,
        action="Validation du paiement #1",
        defaults={
            'target_model': 'PaymentProof',
            'target_id': '1',
            'details': 'Validation du paiement de 20 000 FCFA pour Aïssata Coulibaly (Fondamentaux).'
        }
    )

    print("✓ Données d'amorçage créées avec succès !")
    print(f"👉 Certificat test consultable publiquement avec le code : {cert_demo.certificate_code}")

if __name__ == '__main__':
    run_seed()
